import { FormEvent, useMemo, useState } from "react";
import { BookCopy, Plus } from "lucide-react";
import AppShell from "../components/AppShell";
import useProjectState from "../lib/useProjectState";
import { ChapterPlan, createId } from "../lib/workspaceStore";

const Chapters = () => {
  const { project, setProject } = useProjectState();
  const [chapter, setChapter] = useState({
    title: "",
    objective: "",
    boringPartsHint: "",
    humanFocusHint: "",
  });

  const addChapter = (event: FormEvent) => {
    event.preventDefault();
    if (!chapter.title.trim()) return;

    const next: ChapterPlan = {
      id: createId(),
      title: chapter.title.trim(),
      objective: chapter.objective.trim() || "Advance the story",
      boringPartsHint: chapter.boringPartsHint.trim() || "Transitions and setup",
      humanFocusHint: chapter.humanFocusHint.trim() || "Emotion-heavy moments",
    };

    setProject((prev) => ({ ...prev, chapters: [...prev.chapters, next] }));
    setChapter({ title: "", objective: "", boringPartsHint: "", humanFocusHint: "" });
  };

  const recommendations = useMemo(() => {
    if (project.chapters.length === 0) return [] as string[];

    return project.chapters.map((entry, index) => {
      return `Chapter ${index + 1}: Use AI for ${entry.boringPartsHint.toLowerCase()}, keep human writing for ${entry.humanFocusHint.toLowerCase()}.`;
    });
  }, [project.chapters]);

  return (
    <AppShell
      title="Chapter Builder"
      subtitle="Plan each chapter with clear AI-assist zones vs human-only zones so your novel stays alive and personal."
    >
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={addChapter} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Plus className="h-4 w-4" /> Add Chapter Plan
          </h2>
          <div className="space-y-2">
            <input
              value={chapter.title}
              onChange={(event) => setChapter((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Chapter title"
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <textarea
              value={chapter.objective}
              onChange={(event) => setChapter((prev) => ({ ...prev, objective: event.target.value }))}
              placeholder="Chapter objective"
              className="h-20 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <textarea
              value={chapter.boringPartsHint}
              onChange={(event) => setChapter((prev) => ({ ...prev, boringPartsHint: event.target.value }))}
              placeholder="Parts AI can fill (transitions, setup, logistics)"
              className="h-20 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <textarea
              value={chapter.humanFocusHint}
              onChange={(event) => setChapter((prev) => ({ ...prev, humanFocusHint: event.target.value }))}
              placeholder="Parts that must stay human-written"
              className="h-20 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
          </div>
          <button className="mt-3 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-900">Add Chapter</button>
        </form>

        <section className="rounded-2xl border border-white/20 bg-[#f5f4ef] p-4 text-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-3xl">Chapter Stack</h2>
            <BookCopy className="h-5 w-5" />
          </div>

          {project.chapters.length === 0 ? (
            <p className="text-sm text-slate-600">No chapter plans yet.</p>
          ) : (
            <div className="space-y-2">
              {project.chapters.map((entry, index) => (
                <article key={entry.id} className="rounded-lg border border-slate-300 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Chapter {index + 1}</p>
                  <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                  <p className="mt-1 text-sm text-slate-700">{entry.objective}</p>
                  <p className="mt-2 rounded bg-slate-100 p-2 text-xs text-slate-700">
                    AI filler: {entry.boringPartsHint}
                  </p>
                  <p className="mt-1 rounded bg-amber-50 p-2 text-xs text-amber-900">
                    Human highlight: {entry.humanFocusHint}
                  </p>
                </article>
              ))}
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="mt-4 rounded-lg border border-slate-300 bg-white p-3">
              <h3 className="mb-2 text-sm font-semibold">Suggested AI/Human Split</h3>
              <div className="space-y-1 text-xs text-slate-700">
                {recommendations.map((line) => (
                  <p key={line}>- {line}</p>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default Chapters;
