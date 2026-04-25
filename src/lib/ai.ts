import { AIMode } from "@/src/types/writer";

interface AIRequest {
  mode: AIMode;
  text: string;
  context?: string;
}

interface AIResponse {
  result: string;
}

export async function runAI(request: AIRequest): Promise<AIResponse> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as {
        error?: string;
        providerMessage?: string;
        attemptedModels?: string[];
      };
      const attempted = payload.attemptedModels?.length
        ? ` Tried: ${payload.attemptedModels.join(", ")}.`
        : "";
      const message = payload.error || payload.providerMessage || "AI request failed";
      throw new Error(`${message}${attempted}`.trim());
    }

    const errorText = await response.text();
    throw new Error(errorText || "AI request failed");
  }

  return (await response.json()) as AIResponse;
}
