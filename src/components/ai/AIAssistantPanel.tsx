"use client";

import { useEffect } from "react";
import { Loader2, WandSparkles } from "lucide-react";
import { runAI } from "@/src/lib/ai";
import { AIMode } from "@/src/types/writer";
import { useWriterStore } from "@/src/store/writerStore";

const modeLabel: Array<{ mode: AIMode; label: string; description: string }> = [
  { mode: "continue", label: "Continue", description: "Continue naturally from the cursor" },
  { mode: "rewrite", label: "Rewrite", description: "Improve pacing, clarity, and emotion" },
  { mode: "expand", label: "Expand", description: "Expand concise passages" },
  { mode: "describe", label: "Describe", description: "Add sensory detail" },
  { mode: "dialogue", label: "Dialogue", description: "Generate realistic dialogue" },
  { mode: "brainstorm", label: "Brainstorm", description: "Ideas for twists and arcs" },
];

interface AIAssistantPanelProps {
  contextText: string;
  onAccept: (result: string) => void;
}

export default function AIAssistantPanel({ contextText, onAccept }: AIAssistantPanelProps) {
  const {
    aiMode,
    aiLoadingState,
    aiPreview,
    selectedText,
    setAIMode,
    setAIState,
    getCurrentProject,
  } = useWriterStore();

  const project = getCurrentProject();

  const runSelectedMode = async () => {
    const baseText = selectedText || contextText;
    if (!baseText?.trim()) return;

    setAIState({ aiLoadingState: true });
    try {
      const response = await runAI({
        mode: aiMode,
        text: baseText,
        context: `Project: ${project.title}\nOutline: ${project.outline}\nCharacters: ${project.characters.map((c) => `${c.name} (${c.personality})`).join(", ")}`,
      });
      setAIState({ aiPreview: response.result, aiLoadingState: false });
    } catch (error) {
      setAIState({ aiLoadingState: false, aiPreview: `AI error: ${(error as Error).message}` });
    }
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        if (!aiLoadingState) {
          void runSelectedMode();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <aside className="flex h-full flex-col gap-3 border-l border-slate-300 bg-[#f8f6ef] p-3">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">AI Writing Partner</p>
        <p className="mt-1 text-xs text-slate-500">Selected text is prioritized. Cmd/Ctrl + Enter runs the active mode.</p>
      </header>

      <div className="grid gap-2">
        {modeLabel.map((entry) => (
          <button
            key={entry.mode}
            onClick={() => setAIMode(entry.mode)}
            className={`rounded-lg border p-2 text-left transition ${
              aiMode === entry.mode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-300 bg-white"
            }`}
          >
            <p className="text-sm font-semibold">{entry.label}</p>
            <p className={`text-xs ${aiMode === entry.mode ? "text-slate-200" : "text-slate-500"}`}>{entry.description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={() => void runSelectedMode()}
        disabled={aiLoadingState}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {aiLoadingState ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
        Generate Suggestion
      </button>

      <section className="flex-1 rounded-lg border border-slate-300 bg-white p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">AI Preview</p>
        <div className="max-h-[44vh] overflow-y-auto text-sm leading-6 text-slate-700 whitespace-pre-wrap">
          {aiPreview || "Run an AI mode to preview content before insertion."}
        </div>
      </section>

      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!aiPreview) return;
            onAccept(aiPreview);
            setAIState({ aiPreview: "" });
          }}
          className="flex-1 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"
        >
          Accept
        </button>
        <button
          onClick={() => setAIState({ aiPreview: "" })}
          className="flex-1 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
        >
          Reject
        </button>
      </div>
    </aside>
  );
}
