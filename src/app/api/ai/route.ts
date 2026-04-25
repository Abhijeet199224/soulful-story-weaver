import { NextRequest } from "next/server";
import { buildPrompt } from "@/src/lib/prompts";
import { AIMode } from "@/src/types/writer";

export const runtime = "nodejs";

const validModes: AIMode[] = ["continue", "rewrite", "expand", "describe", "dialogue", "brainstorm"];

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

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, stream: Boolean(stream) }),
    });

    if (!response.ok) {
      const textError = await response.text();
      return Response.json({ error: textError || "AI provider error" }, { status: response.status });
    }

    if (stream && response.body) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const result = data.choices?.[0]?.message?.content?.trim() || "";
    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: (error as Error).message || "Unexpected error" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ status: "ok", message: "POST mode/text to this endpoint. Set stream=true for SSE passthrough." });
}
