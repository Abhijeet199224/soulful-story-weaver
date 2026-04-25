import { FormEvent, useState } from "react";
import { Camera, FileText, Globe, MapPinned, Plus } from "lucide-react";
import AppShell from "../components/AppShell";
import useProjectState from "../lib/useProjectState";
import { Platform, RealLifeMoment, createId } from "../lib/workspaceStore";

const iconByPlatform = {
  instagram: Camera,
  x: Globe,
  facebook: Globe,
  article: FileText,
} satisfies Record<Platform, any>;

const Moments = () => {
  const { project, setProject } = useProjectState();
  const [consent, setConsent] = useState(false);
  const [moment, setMoment] = useState({
    source: "instagram" as Platform,
    title: "",
    content: "",
    attachedTo: "",
  });

  const addMoment = (event: FormEvent) => {
    event.preventDefault();
    if (!consent || !moment.content.trim()) return;

    const next: RealLifeMoment = {
      id: createId(),
      source: moment.source,
      title: moment.title.trim() || "Untitled moment",
      content: moment.content.trim(),
      attachedTo: moment.attachedTo.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setProject((prev) => ({ ...prev, moments: [next, ...prev.moments] }));
    setMoment((prev) => ({ ...prev, title: "", content: "", attachedTo: "" }));
  };

  return (
    <AppShell
      title="Real-Life Moments"
      subtitle="Attach social posts, articles, and lived experiences to specific chapters so fiction stays emotionally grounded."
    >
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={addMoment} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Plus className="h-4 w-4" /> Attach Story Moment
          </h2>

          <label className="mb-3 flex cursor-pointer items-start gap-2 text-xs text-slate-100">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            I consent to attach this content to my private story project.
          </label>

          <div className="space-y-2">
            <select
              value={moment.source}
              onChange={(event) => setMoment((prev) => ({ ...prev, source: event.target.value as Platform }))}
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            >
              <option value="instagram">Instagram Post</option>
              <option value="x">X Post</option>
              <option value="facebook">Facebook Memory</option>
              <option value="article">Article / Blog</option>
            </select>
            <input
              value={moment.title}
              onChange={(event) => setMoment((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Moment title"
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <textarea
              value={moment.content}
              onChange={(event) => setMoment((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="Paste caption/post excerpt/article paragraph..."
              className="h-24 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <input
              value={moment.attachedTo}
              onChange={(event) => setMoment((prev) => ({ ...prev, attachedTo: event.target.value }))}
              placeholder="Attach to chapter (optional)"
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
          </div>
          <button
            disabled={!consent}
            className="mt-3 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            Save Moment
          </button>
        </form>

        <section className="rounded-2xl border border-white/20 bg-[#f5f4ef] p-4 text-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-3xl">Moment Library</h2>
            <MapPinned className="h-5 w-5" />
          </div>
          {project.moments.length === 0 ? (
            <p className="text-sm text-slate-600">No moments attached yet.</p>
          ) : (
            <div className="space-y-2">
              {project.moments.map((entry) => {
                const Icon = iconByPlatform[entry.source];
                return (
                  <article key={entry.id} className="rounded-lg border border-slate-300 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                    <h3 className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                      <Icon className="h-4 w-4" /> {entry.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-700">{entry.content}</p>
                    {entry.attachedTo && (
                      <p className="mt-2 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">Attached to: {entry.attachedTo}</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default Moments;
