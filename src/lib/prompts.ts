import { AIMode } from "@/src/types/writer";

const templates: Record<AIMode, string> = {
  continue: "Continue this story in the same tone and style:",
  rewrite: "Rewrite this passage to improve pacing, clarity, and engagement:",
  expand: "Expand this into a more detailed and vivid scene:",
  describe: "Add rich sensory details to make this more immersive:",
  dialogue: "Write natural dialogue between characters in this scene:",
  brainstorm: "Generate fiction writing ideas (plot twists, conflicts, character arcs) based on:",
};

export function buildPrompt(mode: AIMode, text: string, context?: string): string {
  const header = templates[mode] || templates.continue;
  const contextBlock = context?.trim() ? `\n\nContext:\n${context.trim()}` : "";
  return `${header}\n\n${text}${contextBlock}`;
}
