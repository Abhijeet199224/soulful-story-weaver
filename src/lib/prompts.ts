import { AIMode } from "@/src/types/writer";

const templates: Record<AIMode, string> = {
  continue:
    "Continue this story in the same tone and style. Return only the continuation text to insert, with no explanation, no notes, no headings, no bullet points, and no markdown:",
  rewrite:
    "Rewrite this passage to improve pacing, clarity, and engagement. Return only the rewritten passage, with no explanation, no notes, no headings, no bullet points, and no markdown:",
  expand:
    "Expand this into a more detailed and vivid scene. Return only the expanded scene text, with no explanation, no notes, no headings, no bullet points, and no markdown:",
  describe:
    "Add rich sensory details to make this more immersive. Return only the updated prose to insert, with no explanation, no notes, no headings, no bullet points, and no markdown:",
  dialogue:
    "Write natural dialogue between characters in this scene. Return only the dialogue scene text, with no explanation, no notes, no headings, no bullet points, and no markdown:",
  brainstorm:
    "Generate fiction writing ideas (plot twists, conflicts, character arcs). Return only concise idea lines, with no preface and no analysis section:",
};

export function buildPrompt(mode: AIMode, text: string, context?: string): string {
  const header = templates[mode] || templates.continue;
  const contextBlock = context?.trim() ? `\n\nContext:\n${context.trim()}` : "";
  return `${header}\n\n${text}${contextBlock}`;
}
