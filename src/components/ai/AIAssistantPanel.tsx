"use client";

import { useCallback, useEffect } from "react";
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

  const runSelectedMode = useCallback(async () => {
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
  }, [aiMode, contextText, project.characters, project.outline, project.title, selectedText, setAIState]);

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
  }, [aiLoadingState, runSelectedMode]);

  return (
    <aside className="soul-glass flex h-full flex-col gap-3 rounded-xl border border-white/20 p-3">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">AI Writing Partner</p>
        <p className="mt-1 text-xs text-slate-400">Selected text is prioritized. Cmd/Ctrl + Enter runs the active mode.</p>
      </header>

      <div className="grid gap-2">
        {modeLabel.map((entry) => (
          <button
            key={entry.mode}
            onClick={() => setAIMode(entry.mode)}
            className={`rounded-lg border p-2 text-left transition ${
              aiMode === entry.mode ? "border-amber-300/70 bg-amber-200 text-slate-900" : "border-white/20 bg-black/20 text-slate-100"
            }`}
          >
            <p className="text-sm font-semibold">{entry.label}</p>
            <p className={`text-xs ${aiMode === entry.mode ? "text-slate-700" : "text-slate-400"}`}>{entry.description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={() => void runSelectedMode()}
        disabled={aiLoadingState}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
      >
        {aiLoadingState ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
        Generate Suggestion
      </button>

      <section className="flex-1 rounded-lg border border-white/20 bg-black/20 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">AI Preview</p>
        <div className="max-h-[44vh] overflow-y-auto text-sm leading-6 text-slate-100 whitespace-pre-wrap">
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
          className="flex-1 rounded-md border border-emerald-300/60 bg-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-950"
        >
          Accept
        </button>
        <button
          onClick={() => setAIState({ aiPreview: "" })}
          className="flex-1 rounded-md border border-rose-300/60 bg-rose-200 px-3 py-2 text-xs font-semibold text-rose-950"
        >
          Reject
        </button>
      </div>
    </aside>
  );
}
