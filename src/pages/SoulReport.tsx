import { useMemo } from "react";
import { BadgeCheck, FileWarning, HeartPulse } from "lucide-react";
import AppShell from "../components/AppShell";
import useProjectState from "../lib/useProjectState";
import { getSoulSummary } from "../lib/workspaceStore";

const SoulReport = () => {
  const { project } = useProjectState();

  const report = useMemo(() => {
    const drafts = project.drafts;
    if (drafts.length === 0) {
      return {
        aiFeel: 0,
        humanTouch: 0,
        readyToPublish: false,
      };
    }

    const avgSoul = drafts.reduce((sum, draft) => sum + draft.soulSlider, 0) / drafts.length;
    const aiFeel = Math.round(avgSoul);
    const humanTouch = 100 - aiFeel;
    const readyToPublish = humanTouch >= 45 && project.characters.length >= 2 && project.plotBeats.length >= 4;

    return { aiFeel, humanTouch, readyToPublish };
  }, [project]);

  const latest = project.drafts[project.drafts.length - 1];

  return (
    <AppShell
      title="Soul Checker Report"
      subtitle="Review whether your manuscript still feels human or too machine-generated before publication."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <FileWarning className="h-4 w-4" /> AI-Generated Feel
          </p>
          <p className="text-4xl font-semibold text-white">{report.aiFeel}%</p>
          <p className="mt-2 text-xs text-slate-300">Lower is often better for emotional originality.</p>
        </article>

        <article className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <HeartPulse className="h-4 w-4" /> Human Touch
          </p>
          <p className="text-4xl font-semibold text-white">{report.humanTouch}%</p>
          <p className="mt-2 text-xs text-slate-300">Increase this by rewriting highlighted segments.</p>
        </article>

        <article className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <BadgeCheck className="h-4 w-4" /> Publish Readiness
          </p>
          <p className="text-2xl font-semibold text-white">{report.readyToPublish ? "Ready" : "Needs Human Refinement"}</p>
          <p className="mt-2 text-xs text-slate-300">Criteria: character depth, plot structure, and human voice score.</p>
        </article>
      </div>

      <section className="mt-4 rounded-2xl border border-white/20 bg-[#f5f4ef] p-4 text-slate-900">
        <h2 className="font-display text-3xl">Latest Draft Snapshot</h2>
        {latest ? (
          <div className="mt-2 space-y-2 text-sm">
            <p>
              <span className="font-semibold">Draft title:</span> {latest.title}
            </p>
            <p>
              <span className="font-semibold">Soul slider level:</span> {latest.soulSlider}% ({getSoulSummary(latest)})
            </p>
            <p>
              <span className="font-semibold">Prompt:</span> {latest.prompt}
            </p>
            <p className="rounded-md bg-white p-3 text-slate-700">{latest.output.map((segment) => segment.text).join(" ")}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Create drafts in Draft Studio to generate your first Soul Report.</p>
        )}
      </section>
    </AppShell>
  );
};

export default SoulReport;
