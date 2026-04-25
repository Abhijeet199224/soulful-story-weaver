import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    const AI_API_URL = Deno.env.get("AI_API_URL") || "https://api.openai.com/v1/chat/completions";
    const AI_MODEL = Deno.env.get("AI_MODEL") || "gpt-4.1-mini";
    if (!AI_API_KEY) throw new Error("AI_API_KEY is not configured");

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

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
