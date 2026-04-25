import { FormEvent, useState } from "react";
import { Map, Plus } from "lucide-react";
import AppShell from "../components/AppShell";
import useProjectState from "../lib/useProjectState";
import { PlotBeat, createId } from "../lib/workspaceStore";

const Plot = () => {
  const { project, setProject } = useProjectState();
  const [meta, setMeta] = useState({
    projectTitle: project.projectTitle,
    genre: project.genre,
    desiredLength: project.desiredLength,
  });
  const [beat, setBeat] = useState<Pick<PlotBeat, "stage" | "title" | "summary">>({
    stage: "setup",
    title: "",
    summary: "",
  });

  const saveMeta = (event: FormEvent) => {
    event.preventDefault();
    setProject((prev) => ({ ...prev, ...meta }));
  };

  const addBeat = (event: FormEvent) => {
    event.preventDefault();
    if (!beat.title.trim()) return;

    const nextBeat: PlotBeat = {
      id: createId(),
      stage: beat.stage,
      title: beat.title.trim(),
      summary: beat.summary.trim() || "No summary added",
    };

    setProject((prev) => ({ ...prev, plotBeats: [...prev.plotBeats, nextBeat] }));
    setBeat({ stage: "setup", title: "", summary: "" });
  };

  return (
    <AppShell
      title="Plot Architect"
      subtitle="Shape your narrative skeleton first so AI can draft filler transitions while your major beats stay human-directed."
    >
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <form onSubmit={saveMeta} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <h2 className="mb-3 font-semibold text-white">Project Blueprint</h2>
            <div className="space-y-2">
              <input
                value={meta.projectTitle}
                onChange={(event) => setMeta((prev) => ({ ...prev, projectTitle: event.target.value }))}
                placeholder="Project title"
                className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
              />
              <input
                value={meta.genre}
                onChange={(event) => setMeta((prev) => ({ ...prev, genre: event.target.value }))}
                placeholder="Genre"
                className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
              />
              <input
                value={meta.desiredLength}
                onChange={(event) => setMeta((prev) => ({ ...prev, desiredLength: event.target.value }))}
                placeholder="Desired length"
                className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
              />
            </div>
            <button className="mt-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900">Save Blueprint</button>
          </form>

          <form onSubmit={addBeat} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
              <Plus className="h-4 w-4" /> Add Plot Beat
            </h2>
            <div className="space-y-2">
              <select
                value={beat.stage}
                onChange={(event) => setBeat((prev) => ({ ...prev, stage: event.target.value as PlotBeat["stage"] }))}
                className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
              >
                <option value="setup">Setup</option>
                <option value="inciting">Inciting Incident</option>
                <option value="midpoint">Midpoint Shift</option>
                <option value="climax">Climax</option>
                <option value="resolution">Resolution</option>
              </select>
              <input
                value={beat.title}
                onChange={(event) => setBeat((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Beat title"
                className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
              />
              <textarea
                value={beat.summary}
                onChange={(event) => setBeat((prev) => ({ ...prev, summary: event.target.value }))}
                placeholder="What happens in this beat?"
                className="h-24 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
              />
            </div>
            <button className="mt-3 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-900">Add Beat</button>
          </form>
        </div>

        <section className="rounded-2xl border border-white/20 bg-[#f5f4ef] p-4 text-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-3xl">Plot Timeline</h2>
            <Map className="h-5 w-5" />
          </div>
          <div className="mb-3 rounded-lg bg-slate-100 p-3 text-sm">
            <p className="font-semibold">{project.projectTitle}</p>
            <p className="text-slate-600">{project.genre} • Target: {project.desiredLength}</p>
          </div>
          {project.plotBeats.length === 0 ? (
            <p className="text-sm text-slate-600">No beats yet. Create structure before drafting chapters.</p>
          ) : (
            <div className="space-y-2">
              {project.plotBeats.map((entry, index) => (
                <article key={entry.id} className="rounded-lg border border-slate-300 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    Beat {index + 1}: {entry.stage}
                  </p>
                  <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                  <p className="mt-1 text-sm text-slate-700">{entry.summary}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default Plot;
