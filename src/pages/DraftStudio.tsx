import { FormEvent, useMemo, useState } from "react";
import { Lightbulb, Sparkles, WandSparkles } from "lucide-react";
import AppShell from "../components/AppShell";
import useProjectState from "../lib/useProjectState";
import { DraftSegment, StoryDraft, createId } from "../lib/workspaceStore";

const guidanceByNeed = [
  "Add a specific sensory detail from your own memory.",
  "Rewrite this line in your natural voice and rhythm.",
  "Mention one emotional contradiction to increase authenticity.",
  "Anchor the paragraph to a character's internal conflict.",
];

const generateSegments = (prompt: string, soulSlider: number, details: string): DraftSegment[] => {
  const fullAi: DraftSegment[] = [
    {
      id: createId(),
      needsHuman: false,
      text: `The evening unfolded with deliberate calm. ${prompt} The city around the characters moved like a second heartbeat, and every small action hinted at the larger transformation to come.`,
    },
    {
      id: createId(),
      needsHuman: false,
      text: `Details considered: ${details}. The chapter balanced scene movement, emotional interiority, and tension while preserving narrative clarity.`,
    },
    {
      id: createId(),
      needsHuman: false,
      text: "By the final beat, the transition felt earned. The story pushed forward with cohesion, creating momentum for the next chapter.",
    },
  ];

  if (soulSlider >= 95) return fullAi;

  const humanWeight = Math.max(1, Math.round((100 - soulSlider) / 25));
  const mixed = [...fullAi];

  for (let i = 0; i < humanWeight; i += 1) {
    const suggestion = guidanceByNeed[i % guidanceByNeed.length];
    mixed.push({
      id: createId(),
      needsHuman: true,
      suggestion,
      text: "[Human touch required] This section should be rewritten in your personal style to avoid generic AI voice.",
    });
  }

  return mixed;
};

const DraftStudio = () => {
  const { project, setProject } = useProjectState();
  const [draftTitle, setDraftTitle] = useState("Chapter Draft");
  const [prompt, setPrompt] = useState("");
  const [details, setDetails] = useState("");
  const [soulSlider, setSoulSlider] = useState(72);
  const [currentOutput, setCurrentOutput] = useState<DraftSegment[]>([]);

  const selectedMoments = useMemo(() => project.moments.slice(0, 4), [project.moments]);

  const onGenerate = (event: FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) return;

    const generated = generateSegments(prompt.trim(), soulSlider, details.trim());
    setCurrentOutput(generated);

    const draft: StoryDraft = {
      id: createId(),
      title: draftTitle.trim() || "Untitled Draft",
      soulSlider,
      prompt: `${prompt.trim()} ${details.trim()}`.trim(),
      output: generated,
      createdAt: new Date().toISOString(),
    };

    setProject((prev) => ({ ...prev, drafts: [...prev.drafts, draft] }));
  };

  const aiModeLabel = useMemo(() => {
    if (soulSlider >= 95) return "100% AI mode: full draft generated";
    if (soulSlider >= 70) return "AI leads with selective human interventions";
    if (soulSlider >= 40) return "Balanced co-writing with human rewrite checkpoints";
    return "Human-led: AI creates sparse scaffolding";
  }, [soulSlider]);

  return (
    <AppShell
      title="Draft Studio"
      subtitle="Generate novel sections, short stories, or journals with AI, then use Soul Checker to preserve human voice where it matters."
    >
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={onGenerate} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <WandSparkles className="h-4 w-4" /> AI Draft Controls
          </h2>
          <div className="space-y-2">
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Draft title"
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Prompt (scene, chapter transition, short story idea...)"
              className="h-24 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Characters mood, length, setting, chapter goals, attached moments..."
              className="h-24 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-3 rounded-lg border border-white/20 bg-black/20 p-3">
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-slate-200">Soul Checker Slider</p>
            <input
              type="range"
              min={0}
              max={100}
              value={soulSlider}
              onChange={(event) => setSoulSlider(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-300 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <p className="mt-2 text-xs text-slate-200">{soulSlider}% AI intensity • {aiModeLabel}</p>
          </div>

          <button className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4" /> Generate Draft
          </button>
        </form>

        <div className="space-y-4">
          <section className="rounded-2xl border border-white/20 bg-[#f5f4ef] p-4 text-slate-900">
            <h2 className="mb-3 font-display text-3xl">Generated Story</h2>
            {currentOutput.length === 0 ? (
              <p className="text-sm text-slate-600">No draft yet. Use the controls to generate your first story section.</p>
            ) : (
              <div className="space-y-2">
                {currentOutput.map((segment) => (
                  <article
                    key={segment.id}
                    className={`rounded-md border p-3 text-sm leading-7 ${
                      segment.needsHuman
                        ? "border-amber-400 bg-amber-50 text-amber-900"
                        : "border-slate-300 bg-white text-slate-800"
                    }`}
                  >
                    <p>{segment.text}</p>
                    {segment.needsHuman && segment.suggestion && (
                      <p className="mt-2 rounded bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                        Suggestion: {segment.suggestion}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/20 bg-[#f5f4ef] p-4 text-slate-900">
            <h2 className="mb-2 flex items-center gap-2 font-display text-3xl">
              <Lightbulb className="h-6 w-6" /> Real-Life Moment Boost
            </h2>
            <p className="mb-3 text-sm text-slate-700">
              Attach moments from social posts, articles, or travel journals in the Real-Life Moments page. They appear here
              as writing fuel.
            </p>
            {selectedMoments.length === 0 ? (
              <p className="text-sm text-slate-600">No attached moments yet.</p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {selectedMoments.map((moment) => (
                  <article key={moment.id} className="rounded-md border border-slate-300 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{moment.source}</p>
                    <h3 className="font-semibold text-slate-900">{moment.title}</h3>
                    <p className="mt-1 text-sm text-slate-700">{moment.content}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default DraftStudio;
