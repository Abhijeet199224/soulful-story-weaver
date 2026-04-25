import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      body: {
        error:
          `Gemini quota exceeded for model ${model}. ` +
          "If you have Gemini Pro access, set AI_MODEL to a Pro model (for example: gemini-1.5-pro) " +
          "and ensure billing/quota is enabled in the same Google AI project." +
          retryHint,
        providerMessage: message,
      },
    };
  }

  return {
    status,
    body: {
      error: message || "AI service error",
    },
  };
}

function isQuotaExceededError(status: number, raw: string) {
  const message = extractProviderMessage(raw).toLowerCase();
  return status === 429 || message.includes("resource_exhausted") || message.includes("quota exceeded");
}

function buildModelFallbackList(primaryModel: string, configuredFallbacks?: string | null) {
  const defaults = ["gemini-1.5-pro", "gemini-2.0-flash"];
  const configured = (configuredFallbacks || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return Array.from(new Set([primaryModel, ...(configured.length ? configured : defaults)]));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    const AI_API_URL = Deno.env.get("AI_API_URL") || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    const AI_MODEL = Deno.env.get("AI_MODEL") || "gemini-2.0-flash";
    const AI_FALLBACK_MODELS = Deno.env.get("AI_FALLBACK_MODELS");
    const fallbackModels = buildModelFallbackList(AI_MODEL, AI_FALLBACK_MODELS);
    if (!AI_API_KEY) throw new Error("AI_API_KEY is not configured");

    const looksLikeGeminiKey = AI_API_KEY.startsWith("AIza");
    const pointsToOpenAI = /api\.openai\.com/i.test(AI_API_URL);
    if (looksLikeGeminiKey && pointsToOpenAI) {
      throw new Error(
        "Provider mismatch: Gemini API key detected but AI_API_URL points to OpenAI. Use https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
      );
    }

    const systemPrompts: Record<string, string> = {
      story: `You are SoulScript's AI Story Developer — a creative writing partner. You help authors:
- Brainstorm plot ideas and story arcs
- Develop compelling characters with rich backstories
- Write scenes, dialogues, and descriptions
- Suggest plot twists and narrative techniques
- Provide feedback on story structure and pacing
Keep responses vivid, creative, and inspiring. Use markdown formatting for structure.`,
      generate: `You are a creative fiction writer. Generate a continuation or new passage for a novel chapter. 
Write in a literary, evocative style. Match the tone indicated by the soul level:
- Low soul level (0-30): Very human, emotional, personal writing
- Medium soul level (30-70): Collaborative blend of human warmth and AI structure
- High soul level (70-100): More structured, descriptive, AI-style prose
Return ONLY the story text, no meta-commentary.`,
      character: `You are a character development specialist. Help create detailed, believable characters with:
- Name and role in the story
- Key personality traits (3-5)
- Backstory and motivations
- Relationships with other characters
- Character arc and growth potential
Be creative and provide specific, actionable details.`,
    };

    const systemPrompt = systemPrompts[mode] || systemPrompts.story;

    let response: Response | null = null;
    let usedModel = AI_MODEL;
    let lastQuotaError: { status: number; raw: string; model: string } | null = null;

    for (const candidateModel of fallbackModels) {
      const attempt = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: candidateModel,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      });

      if (attempt.ok) {
        response = attempt;
        usedModel = candidateModel;
        break;
      }

      if (attempt.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const t = await attempt.text();
      console.error("AI gateway error:", attempt.status, t);
      if (!isQuotaExceededError(attempt.status, t)) {
        const normalized = normalizeProviderError(attempt.status, t, candidateModel);
        return new Response(
          JSON.stringify({ ...normalized.body, attemptedModels: fallbackModels }),
          { status: normalized.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      lastQuotaError = { status: attempt.status, raw: t, model: candidateModel };
    }

    if (!response) {
      const fallbackError =
        lastQuotaError ||
        ({ status: 429, raw: "Quota exceeded for all configured models.", model: AI_MODEL } as {
          status: number;
          raw: string;
          model: string;
        });
      const normalized = normalizeProviderError(fallbackError.status, fallbackError.raw, fallbackError.model);
      return new Response(
        JSON.stringify({ ...normalized.body, attemptedModels: fallbackModels }),
        { status: normalized.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-AI-Model": usedModel },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
