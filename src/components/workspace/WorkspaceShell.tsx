"use client";

import dynamic from "next/dynamic";
import { Download, FileText, History } from "lucide-react";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useRef, useState } from "react";
import TipTapEditor, { TipTapEditorRef } from "@/src/components/editor/TipTapEditor";
import ProjectSidebar from "@/src/components/layout/ProjectSidebar";
import { useWriterStore } from "@/src/store/writerStore";

const AIAssistantPanel = dynamic(() => import("@/src/components/ai/AIAssistantPanel"), {
  ssr: false,
  loading: () => <div className="h-full border-l border-slate-300 bg-[#f8f6ef] p-4 text-sm text-slate-500">Loading AI partner...</div>,
});

export default function WorkspaceShell() {
  const editorRef = useRef<TipTapEditorRef | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [characterName, setCharacterName] = useState("");
  const [characterPersonality, setCharacterPersonality] = useState("");
  const [characterGoals, setCharacterGoals] = useState("");

  const {
    editorContent,
    selectedText,
    versionHistory,
    updateEditorContent,
    setAIState,
    pushVersionSnapshot,
    restoreVersion,
    addCharacter,
    updateOutline,
    getCurrentProject,
    getCurrentScene,
  } = useWriterStore();

  const project = getCurrentProject();
  const scene = getCurrentScene();

  useEffect(() => {
    const timer = setTimeout(() => {
      updateEditorContent(editorContent);
    }, 500);
    return () => clearTimeout(timer);
  }, [editorContent, updateEditorContent]);

  const exportMarkdown = () => {
    const blob = new Blob([editorContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title}-${scene.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const pdf = new jsPDF();
    const stripped = editorContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const lines = pdf.splitTextToSize(stripped || "", 180);
    pdf.setFontSize(12);
    pdf.text(lines, 15, 20);
    pdf.save(`${project.title}-${scene.title}.pdf`);
  };

  const recentVersions = useMemo(
    () => versionHistory.filter((entry) => entry.sceneId === scene.id).slice(0, 6),
    [versionHistory, scene.id]
  );

  return (
    <div className="h-screen overflow-hidden bg-transparent p-3">
      <div className="grid h-full grid-cols-[300px_minmax(0,1fr)_340px] gap-3">
        <div className="grid h-full grid-rows-[minmax(0,1fr)_minmax(0,290px)] gap-3">
          <ProjectSidebar />

          <section className="overflow-y-auto rounded-xl border border-slate-300 bg-white p-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Characters & Outline</h2>
            <div className="mt-2 space-y-2">
              <input value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Character name" className="w-full rounded border border-slate-300 px-2 py-1 text-xs" />
              <input value={characterPersonality} onChange={(e) => setCharacterPersonality(e.target.value)} placeholder="Personality" className="w-full rounded border border-slate-300 px-2 py-1 text-xs" />
              <input value={characterGoals} onChange={(e) => setCharacterGoals(e.target.value)} placeholder="Goals" className="w-full rounded border border-slate-300 px-2 py-1 text-xs" />
              <button
                onClick={() => {
                  if (!characterName.trim()) return;
                  addCharacter({
                    name: characterName.trim(),
                    personality: characterPersonality.trim(),
                    goals: characterGoals.trim(),
                  });
                  setCharacterName("");
                  setCharacterPersonality("");
                  setCharacterGoals("");
                }}
                className="w-full rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-semibold"
              >
                Add Character
              </button>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-slate-700">
              {project.characters.map((character) => (
                <div key={character.id} className="rounded border border-slate-200 bg-slate-50 p-2">
                  <p className="font-semibold">{character.name}</p>
                  <p>{character.personality}</p>
                  <p className="text-slate-500">Goal: {character.goals}</p>
                </div>
              ))}
            </div>

            <textarea
              value={project.outline}
              onChange={(event) => updateOutline(event.target.value)}
              placeholder="Story outline..."
              className="mt-3 h-24 w-full rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </section>
        </div>

        <main className="flex h-full flex-col gap-3 overflow-hidden rounded-xl border border-slate-300 bg-[#f7f5ef] p-3">
          <header className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white p-2">
            <p className="text-sm font-semibold text-slate-700">{project.title} / {scene.title}</p>
            <p className="ml-auto text-xs text-slate-500">{wordCount} words</p>
            <button onClick={exportMarkdown} className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs">
              <FileText className="h-3.5 w-3.5" /> Markdown
            </button>
            <button onClick={exportPDF} className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs">
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TipTapEditor
              ref={editorRef}
              content={editorContent}
              onChange={(content) => updateEditorContent(content)}
              onSelectionChange={(text) => setAIState({ selectedText: text })}
              onWordCountChange={setWordCount}
              onSnapshot={pushVersionSnapshot}
            />
          </div>

          <section className="rounded-lg border border-slate-300 bg-white p-2">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <History className="h-3.5 w-3.5" /> Version Timeline
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentVersions.length === 0 ? (
                <p className="text-xs text-slate-500">No snapshots yet.</p>
              ) : (
                recentVersions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => restoreVersion(version.id)}
                    className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs"
                  >
                    {new Date(version.timestamp).toLocaleTimeString()}
                  </button>
                ))
              )}
            </div>
          </section>
        </main>

        <AIAssistantPanel
          contextText={selectedText || editorContent.replace(/<[^>]+>/g, " ").trim()}
          onAccept={(result) => {
            if (selectedText) {
              editorRef.current?.replaceSelection(result);
            } else {
              editorRef.current?.insertAtCursor(`\n${result}`);
            }
          }}
        />
      </div>
    </div>
  );
}
