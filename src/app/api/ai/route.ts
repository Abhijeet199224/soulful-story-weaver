import { NextRequest } from "next/server";
import { buildPrompt } from "@/src/lib/prompts";
import { AIMode } from "@/src/types/writer";

export const runtime = "nodejs";

const validModes: AIMode[] = ["continue", "rewrite", "expand", "describe", "dialogue", "brainstorm"];

type ProviderErrorBody = {
  error?: {
    message?: string;
    status?: string;
  };
};

function extractProviderMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as ProviderErrorBody | ProviderErrorBody[];
    if (Array.isArray(parsed)) {
      return parsed[0]?.error?.message || raw;
    }
    return parsed?.error?.message || raw;
  } catch {
    return raw;
  }
}

function normalizeProviderError(status: number, raw: string, model: string) {
  const message = extractProviderMessage(raw);
  const lower = message.toLowerCase();
  const quotaExceeded = status === 429 || lower.includes("resource_exhausted") || lower.includes("quota exceeded");
  const retryMatch = message.match(/retry in\s+([\d.]+)s/i) || message.match(/retrydelay\":\s*\"(\d+)s/i);
  const retryHint = retryMatch ? ` Retry after about ${retryMatch[1]}s.` : "";

  if (quotaExceeded) {
    return {
      status: 429,
      error:
        `Gemini quota exceeded for model ${model}. ` +
        "If you have Gemini Pro access, set AI_MODEL to a Pro model (for example: gemini-1.5-pro) " +
        "and ensure billing/quota is enabled in the same Google AI project." +
        retryHint,
      providerMessage: message,
    };
  }

  return {
    status,
    error: message || "AI provider error",
  };
}

function isQuotaExceededError(status: number, raw: string) {
  const message = extractProviderMessage(raw).toLowerCase();
  return status === 429 || message.includes("resource_exhausted") || message.includes("quota exceeded");
}

function isRetryableModelError(status: number, raw: string) {
  const message = extractProviderMessage(raw).toLowerCase();
  return status === 404 && (message.includes("not found") || message.includes("not supported"));
}

function buildModelFallbackList(primaryModel: string, configuredFallbacks?: string) {
  const defaults = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
  const configured = (configuredFallbacks || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return Array.from(new Set([primaryModel, ...(configured.length ? configured : defaults)]));
}

function stripLeadingMetaLines(text: string) {
  const patterns = [
    /^to\s+(expand|rewrite|continue|improve|describe|brainstorm)\b[^\n]*\n+/i,
    /^here(?:'s| is)\b[^\n]*\n+/i,
    /^i\s+(have|will)\b[^\n]*\n+/i,
  ];

  let out = text;
  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of patterns) {
      if (pattern.test(out)) {
        out = out.replace(pattern, "").trimStart();
        changed = true;
      }
    }
  }
  return out;
}

function sanitizeGeneratedText(text: string) {
  let out = (text || "").trim();
  if (!out) return "";

  out = out.replace(/^```[a-zA-Z]*\n?/g, "").replace(/\n?```$/g, "").trim();

  const starParts = out
    .split(/\n\*{3,}\n/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (starParts.length >= 2) {
    out = starParts.reduce((longest, entry) => (entry.length > longest.length ? entry : longest), starParts[0]);
  }

  out = stripLeadingMetaLines(out);

  out = out
    .replace(/\n#{1,6}\s*notes?\b[\s\S]*$/i, "")
    .replace(/\n\*{1,2}\s*notes?\s+for\s+your\s+novel\b[\s\S]*$/i, "")
    .replace(/\n\*{1,2}how\s+does\s+this\s+fit[\s\S]*$/i, "")
    .replace(/\n\s*\*\*\*\s*$/g, "")
    .trim();

  return out;
}

function buildGeminiListModelsUrl(apiUrl: string, apiKey: string) {
  const match = apiUrl.match(/^(https:\/\/generativelanguage\.googleapis\.com\/v[0-9a-z]+)/i);
  const apiBase = match?.[1] || "https://generativelanguage.googleapis.com/v1beta";
  return `${apiBase}/models?key=${encodeURIComponent(apiKey)}`;
}

async function discoverGeminiModels(apiUrl: string, apiKey: string) {
  try {
    const listUrl = buildGeminiListModelsUrl(apiUrl, apiKey);
    const response = await fetch(listUrl);
    if (!response.ok) {
      return [] as string[];
    }

    const data = (await response.json()) as {
      models?: Array<{
        name?: string;
        supportedGenerationMethods?: string[];
      }>;
    };

    const discovered = (data.models || [])
      .filter((model) => (model.supportedGenerationMethods || []).includes("generateContent"))
      .map((model) => (model.name || "").replace(/^models\//, ""))
      .filter((name) => name.toLowerCase().includes("gemini"));

    const score = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes("flash-lite")) return 0;
      if (n.includes("flash")) return 1;
      if (n.includes("pro")) return 2;
      return 3;
    };

    return Array.from(new Set(discovered)).sort((a, b) => score(a) - score(b));
  } catch {
    return [] as string[];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mode, text, context, stream } = (await req.json()) as {
      mode: AIMode;
      text: string;
      context?: string;
      stream?: boolean;
    };

    if (!mode || !validModes.includes(mode)) {
      return Response.json({ error: "Invalid mode" }, { status: 400 });
    }
    if (!text || !text.trim()) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;
    const apiUrl = process.env.AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    const model = process.env.AI_MODEL || "gemini-2.0-flash";
    const fallbackModels = buildModelFallbackList(model, process.env.AI_FALLBACK_MODELS);

    if (!apiKey) {
      return Response.json({ error: "AI_API_KEY is missing" }, { status: 500 });
    }

    const looksLikeGeminiKey = apiKey.startsWith("AIza");
    const pointsToOpenAI = /api\.openai\.com/i.test(apiUrl);
    if (looksLikeGeminiKey && pointsToOpenAI) {
      return Response.json(
        {
          error:
            "Provider mismatch: Gemini API key detected but AI_API_URL points to OpenAI. Set AI_API_URL to https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(mode, text, context);

    const payload = {
      model,
      temperature: 0.75,
      messages: [
        {
          role: "system",
          content:
            "You are Soul Writer, a creative co-writer for fiction authors. Respect style continuity, avoid cliches, and produce polished prose.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    let response: Response | null = null;
    let usedModel = model;
    let lastQuotaError: { status: number; raw: string; model: string } | null = null;
    const attemptedModels: string[] = [];
    let discoveredModelsAdded = false;
    const candidateModels = [...fallbackModels];

    for (let index = 0; index < candidateModels.length; index += 1) {
      const candidateModel = candidateModels[index];
      attemptedModels.push(candidateModel);
      const attempt = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, model: candidateModel, stream: Boolean(stream) }),
      });

      if (attempt.ok) {
        response = attempt;
        usedModel = candidateModel;
        break;
      }

      const textError = await attempt.text();
      if (!isQuotaExceededError(attempt.status, textError) && !isRetryableModelError(attempt.status, textError)) {
        const normalized = normalizeProviderError(attempt.status, textError, candidateModel);
        return Response.json({ ...normalized, attemptedModels }, { status: normalized.status });
      }

      if (isRetryableModelError(attempt.status, textError) && !discoveredModelsAdded) {
        const discoveredModels = await discoverGeminiModels(apiUrl, apiKey);
        for (const discoveredModel of discoveredModels) {
          if (!candidateModels.includes(discoveredModel)) {
            candidateModels.push(discoveredModel);
          }
        }
        discoveredModelsAdded = true;
      }

      lastQuotaError = { status: attempt.status, raw: textError, model: candidateModel };
    }

    if (!response) {
      const fallbackError =
        lastQuotaError ||
        ({ status: 429, raw: "Quota exceeded for all configured models.", model } as { status: number; raw: string; model: string });
      const normalized = normalizeProviderError(fallbackError.status, fallbackError.raw, fallbackError.model);
      return Response.json({ ...normalized, attemptedModels }, { status: normalized.status });
    }

    if (stream && response.body) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-AI-Model": usedModel,
        },
      });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawResult = data.choices?.[0]?.message?.content?.trim() || "";
    const result = sanitizeGeneratedText(rawResult);
    return Response.json({ result, model: usedModel });
  } catch (error) {
    return Response.json({ error: (error as Error).message || "Unexpected error" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ status: "ok", message: "POST mode/text to this endpoint. Set stream=true for SSE passthrough." });
}
