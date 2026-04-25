import { FormEvent, useMemo, useRef, useState } from "react";
import { Lightbulb, Sparkles, WandSparkles } from "lucide-react";
import AppShell from "../components/AppShell";
import useProjectState from "../lib/useProjectState";
import { ChapterLength, ChapterTone, DraftSegment, StoryDraft, createId } from "../lib/workspaceStore";

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

const targetWordsByLength: Record<ChapterLength, number> = {
  short: 550,
  medium: 900,
  long: 1400,
};

const chapterToneLine: Record<ChapterTone, string> = {
  neutral: "Keep the prose clear and balanced.",
  poetic: "Use lyrical imagery and rhythmic sentence flow.",
  dramatic: "Increase tension, stakes, and momentum.",
  introspective: "Prioritize interior monologue and emotional reflection.",
  casual: "Keep voice conversational, immediate, and reader-friendly.",
};

const buildChapterDraft = (
  title: string,
  prompt: string,
  tone: ChapterTone,
  length: ChapterLength,
  characterNames: string[]
): string => {
  const castLine = characterNames.length ? `Characters in focus: ${characterNames.join(", ")}.` : "Characters in focus: narrator-centered.";
  return [
    `## ${title}`,
    `${castLine}`,
    chapterToneLine[tone],
    `Story intent: ${prompt}`,
    "",
    "The chapter opens with a grounded scene that gives readers immediate context and emotional direction. The narration keeps one clear thread while layering sensory detail and personal stakes.",
    "",
    "Midway through, a shift occurs: a memory, decision, or conflict forces the protagonist to confront what they have been avoiding. This section should bridge plot movement with emotional consequence.",
    "",
    "The chapter closes on a meaningful forward pull so the next chapter feels inevitable rather than mechanical.",
  ].join("\n");
};

const splitIntoChapters = (writingPad: string): Array<{ title: string; content: string }> => {
  const headingMatch = writingPad.match(/^##\s+.+$/gm);
  if (headingMatch && headingMatch.length > 0) {
    const parts = writingPad.split(/(?=^##\s+.+$)/gm).map((part) => part.trim()).filter(Boolean);
    return parts.map((part, index) => {
      const first = part.split("\n")[0].replace(/^##\s+/, "").trim();
      return { title: first || `Chapter ${index + 1}`, content: part };
    });
  }

  const words = writingPad.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const chunkSize = 700;
  const chunks: Array<{ title: string; content: string }> = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    const index = Math.floor(i / chunkSize) + 1;
    const content = words.slice(i, i + chunkSize).join(" ");
    chunks.push({ title: `Chapter ${index}`, content: `## Chapter ${index}\n\n${content}` });
  }
  return chunks;
};

const DraftStudio = () => {
  const { project, setProject } = useProjectState();
  const [draftTitle, setDraftTitle] = useState("Chapter Draft");
  const [prompt, setPrompt] = useState("");
  const [details, setDetails] = useState("");
  const [soulSlider, setSoulSlider] = useState(72);
  const [currentOutput, setCurrentOutput] = useState<DraftSegment[]>([]);
  const [writingPad, setWritingPad] = useState(project.writingPad || "");
  const [chapterTitle, setChapterTitle] = useState("Chapter 1");
  const [chapterPrompt, setChapterPrompt] = useState("");
  const [chapterTone, setChapterTone] = useState<ChapterTone>("neutral");
  const [chapterLength, setChapterLength] = useState<ChapterLength>("medium");
  const [chapterCharacterIds, setChapterCharacterIds] = useState<string[]>([]);
  const writingRef = useRef<HTMLTextAreaElement>(null);

  const selectedMoments = useMemo(() => project.moments.slice(0, 4), [project.moments]);

  const setWritingValue = (value: string) => {
    setWritingPad(value);
    setProject((prev) => ({ ...prev, writingPad: value }));
  };

  const wrapSelection = (prefix: string, suffix: string, placeholder: string) => {
    const area = writingRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = writingPad.slice(start, end) || placeholder;
    const next = `${writingPad.slice(0, start)}${prefix}${selected}${suffix}${writingPad.slice(end)}`;
    setWritingValue(next);

    requestAnimationFrame(() => {
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + selected.length;
      area.focus();
      area.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const prefixSelectionLines = (prefix: string, placeholder: string) => {
    const area = writingRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = writingPad.slice(start, end) || placeholder;
    const updated = selected
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");

    const next = `${writingPad.slice(0, start)}${updated}${writingPad.slice(end)}`;
    setWritingValue(next);

    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start, start + updated.length);
    });
  };

  const writingWordCount = useMemo(() => writingPad.trim().split(/\s+/).filter(Boolean).length, [writingPad]);
  const selectedCharacterNames = useMemo(
    () => project.characters.filter((entry) => chapterCharacterIds.includes(entry.id)).map((entry) => entry.name),
    [project.characters, chapterCharacterIds]
  );

  const toggleCharacter = (id: string) => {
    setChapterCharacterIds((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));
  };

  const generateChapter = () => {
    if (!chapterPrompt.trim()) return;
    const content = buildChapterDraft(chapterTitle.trim() || "Untitled Chapter", chapterPrompt.trim(), chapterTone, chapterLength, selectedCharacterNames);
    const next = {
      id: createId(),
      title: chapterTitle.trim() || "Untitled Chapter",
      tone: chapterTone,
      length: chapterLength,
      targetWords: targetWordsByLength[chapterLength],
      characterIds: chapterCharacterIds,
      prompt: chapterPrompt.trim(),
      content,
      createdAt: new Date().toISOString(),
    };

    setProject((prev) => ({ ...prev, chapterDrafts: [...prev.chapterDrafts, next] }));
    setWritingValue(`${writingPad.trim()}\n\n${content}`.trim());
  };

  const autoBreakWriting = () => {
    const chapters = splitIntoChapters(writingPad);
    if (!chapters.length) return;
    const generated = chapters.map((entry, index) => ({
      id: createId(),
      title: entry.title,
      tone: "neutral" as ChapterTone,
      length: "medium" as ChapterLength,
      targetWords: targetWordsByLength.medium,
      characterIds: [],
      prompt: `Auto-extracted from writing pad section ${index + 1}`,
      content: entry.content,
      createdAt: new Date().toISOString(),
    }));
    setProject((prev) => ({ ...prev, chapterDrafts: generated }));
  };

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
      <section className="mb-4 rounded-2xl border border-white/20 bg-[#f5f4ef] p-4 text-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-3xl">Start Writing</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">{writingWordCount} words</p>
        </div>
        <p className="mb-3 text-sm text-slate-700">
          Write directly here before using AI tools. Format quickly with lightweight markdown controls.
        </p>

        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button onClick={() => wrapSelection("**", "**", "bold text")} className="rounded border border-slate-300 bg-white px-2.5 py-1">
            Bold
          </button>
          <button onClick={() => wrapSelection("*", "*", "italic text")} className="rounded border border-slate-300 bg-white px-2.5 py-1">
            Italic
          </button>
          <button onClick={() => prefixSelectionLines("## ", "Heading")} className="rounded border border-slate-300 bg-white px-2.5 py-1">
            Heading
          </button>
          <button onClick={() => prefixSelectionLines("> ", "Quote")} className="rounded border border-slate-300 bg-white px-2.5 py-1">
            Quote
          </button>
          <button onClick={() => prefixSelectionLines("- ", "List item")} className="rounded border border-slate-300 bg-white px-2.5 py-1">
            List
          </button>
          <button onClick={() => setWritingValue("")} className="rounded border border-slate-300 bg-white px-2.5 py-1 text-rose-700">
            Clear
          </button>
        </div>

        <textarea
          ref={writingRef}
          value={writingPad}
          onChange={(event) => setWritingValue(event.target.value)}
          placeholder="Start your story here..."
          className="h-56 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm leading-7"
        />

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={autoBreakWriting}
            className="rounded border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700"
          >
            Auto Break Into Chapters
          </button>
          <span className="text-slate-600">Creates chapter drafts from headings or 700-word segments.</span>
        </div>
      </section>

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
            <h2 className="mb-3 font-display text-3xl">Adaptive Chapter Generator</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={chapterTitle}
                onChange={(event) => setChapterTitle(event.target.value)}
                placeholder="Chapter title"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <select
                value={chapterLength}
                onChange={(event) => setChapterLength(event.target.value as ChapterLength)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="short">Short (~550 words)</option>
                <option value="medium">Medium (~900 words)</option>
                <option value="long">Long (~1400 words)</option>
              </select>
              <select
                value={chapterTone}
                onChange={(event) => setChapterTone(event.target.value as ChapterTone)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="neutral">Neutral</option>
                <option value="poetic">Poetic</option>
                <option value="dramatic">Dramatic</option>
                <option value="introspective">Introspective</option>
                <option value="casual">Casual</option>
              </select>
              <input
                value={targetWordsByLength[chapterLength]}
                readOnly
                className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600"
              />
            </div>

            <textarea
              value={chapterPrompt}
              onChange={(event) => setChapterPrompt(event.target.value)}
              placeholder="What should happen in this chapter?"
              className="mt-3 h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />

            <div className="mt-3 rounded-md border border-slate-300 bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Involved Characters</p>
              {project.characters.length === 0 ? (
                <p className="text-sm text-slate-600">No characters yet. Add them in Characters page to pull here.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {project.characters.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => toggleCharacter(entry.id)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        chapterCharacterIds.includes(entry.id)
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {entry.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={generateChapter}
              className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              Generate Chapter Draft
            </button>
          </section>

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

          <section className="rounded-2xl border border-white/20 bg-[#f5f4ef] p-4 text-slate-900">
            <h2 className="mb-2 font-display text-3xl">Chapter Drafts ({project.chapterDrafts.length})</h2>
            {project.chapterDrafts.length === 0 ? (
              <p className="text-sm text-slate-600">No chapter drafts yet. Generate one or auto-break your writing into chapters.</p>
            ) : (
              <div className="space-y-2">
                {project.chapterDrafts.slice().reverse().map((entry) => (
                  <article key={entry.id} className="rounded-md border border-slate-300 bg-white p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                        {entry.tone} • {entry.length} • {entry.targetWords} words
                      </p>
                    </div>
                    <p className="text-sm text-slate-700">{entry.prompt}</p>
                    <button
                      onClick={() => setWritingValue(`${writingPad.trim()}\n\n${entry.content}`.trim())}
                      className="mt-2 rounded border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      Insert Into Writing Pad
                    </button>
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
