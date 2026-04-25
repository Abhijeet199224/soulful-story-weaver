import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AudioLines,
  BadgeCheck,
  BookOpen,
  ChevronRight,
  Cloud,
  GitCompareArrows,
  Instagram,
  Lock,
  Mic,
  Pause,
  PencilLine,
  Plus,
  Shield,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type Platform = "instagram" | "x" | "facebook";
type SnippetSource = "manual" | "voice" | "social";
type StoryFormat = "short-story" | "journal" | "summary";
type Tone = "poetic" | "casual" | "introspective" | "dramatic";
type PrivacyMode = "private-cloud" | "offline";

interface StorySnippet {
  id: string;
  text: string;
  source: SnippetSource;
  createdAt: string;
  mood: string;
  theme: string;
  people: string;
  socialPlatform?: Platform;
}

interface SoulCheckResult {
  intent: number;
  authenticity: number;
  relatability: number;
  overall: number;
  questions: string[];
  guidance: string[];
}

interface StoryDraft {
  id: string;
  snippetId: string;
  format: StoryFormat;
  tone: Tone;
  createdAt: string;
  text: string;
  soulCheck: SoulCheckResult;
}

const SOCIAL_SEEDS: Record<Platform, string[]> = {
  instagram: [
    "Sunset walk with dad after months of silence. We did not solve everything, but we laughed.",
    "Photo dump from my first week in a new city. Loneliness and excitement both showed up.",
  ],
  x: [
    "Today I finally said no to a project that was draining me. Felt scared but lighter.",
    "Tiny win: cooked dinner instead of doom-scrolling. Brain feels less noisy tonight.",
  ],
  facebook: [
    "Memory from 8 years ago: grandma teaching me to knead dough with patient hands.",
    "Post-reunion reflection: people change, but certain smiles still feel like home.",
  ],
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "had",
  "has",
  "he",
  "her",
  "his",
  "i",
  "in",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "she",
  "that",
  "the",
  "their",
  "them",
  "they",
  "this",
  "to",
  "was",
  "we",
  "were",
  "with",
  "you",
]);

const scoreLabel = (value: number): string => {
  if (value >= 80) return "Strong";
  if (value >= 60) return "Good";
  if (value >= 40) return "Needs care";
  return "Low";
};

const tokenize = (value: string): string[] => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.has(word));
};

const uniqueWords = (value: string): Set<string> => new Set(tokenize(value));

const toPercent = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const buildSoulCheck = (snippet: StorySnippet, story: string): SoulCheckResult => {
  const snippetWords = uniqueWords(`${snippet.text} ${snippet.mood} ${snippet.theme} ${snippet.people}`);
  const draftWords = uniqueWords(story);

  const overlap = Array.from(snippetWords).filter((word) => draftWords.has(word)).length;
  const intentRaw = snippetWords.size ? (overlap / snippetWords.size) * 100 : 40;

  const emotionWords = ["felt", "heart", "afraid", "joy", "sad", "hope", "grief", "love", "calm", "regret"];
  const emotionHits = emotionWords.filter((word) => draftWords.has(word)).length;
  const authenticityRaw = 42 + emotionHits * 8 + (snippet.mood ? 12 : 0);

  const relatableWords = ["we", "I", "family", "friend", "home", "work", "today", "remember", "change"];
  const relatableHits = relatableWords.filter((word) => story.includes(word)).length;
  const relatabilityRaw = 38 + relatableHits * 7;

  const intent = toPercent(intentRaw);
  const authenticity = toPercent(authenticityRaw);
  const relatability = toPercent(relatabilityRaw);
  const overall = toPercent((intent + authenticity + relatability) / 3);

  const questions: string[] = ["Does this feel true to your experience?"];
  if (authenticity < 65) questions.push("Would you like to add a sensory detail from that moment?");
  if (intent < 65) questions.push("Should the story focus more on your original intention?");
  if (relatability < 65) questions.push("Would you like to make the human stakes clearer?");

  const guidance: string[] = [];
  if (snippet.people && !story.toLowerCase().includes(snippet.people.toLowerCase())) {
    guidance.push("Mention the key person directly to ground the story.");
  }
  if (snippet.theme && !story.toLowerCase().includes(snippet.theme.toLowerCase())) {
    guidance.push("Bring the stated theme forward in one explicit line.");
  }
  if (guidance.length === 0) {
    guidance.push("The draft aligns well. You can now refine rhythm and imagery.");
  }

  return { intent, authenticity, relatability, overall, questions, guidance };
};

const generateDraftText = (snippet: StorySnippet, format: StoryFormat, tone: Tone): string => {
  const openerByTone: Record<Tone, string> = {
    poetic: "The moment returned like a soft tide, carrying pieces of the day I thought I had already folded away.",
    casual: "I keep replaying that day because it was simple on the outside, but it shifted something in me.",
    introspective: "I did not realize in the moment that this would become a marker, but memory kept circling back to it.",
    dramatic: "Everything looked ordinary until one small decision turned the evening into a before-and-after line.",
  };

  const body = `It started with this: ${snippet.text.trim()}.

Mood: ${snippet.mood || "uncertain"}. Theme: ${snippet.theme || "personal growth"}. People involved: ${snippet.people || "someone close"}.

I noticed how this moment held contradiction: comfort and discomfort, certainty and doubt, closeness and distance. That tension made the experience feel alive rather than tidy.`;

  const endingByFormat: Record<StoryFormat, string> = {
    "short-story":
      "By the end of the night, nothing dramatic had changed, but my perspective had. The room was the same, yet I stood inside it with a different kind of honesty.",
    journal:
      "Journal note to self: this memory matters because it reveals what I value when no one is performing. I want to carry that clarity into tomorrow.",
    summary:
      "Summary: this snippet reflects a meaningful transition. The experience combines emotional nuance with a clear personal lesson about identity, relationships, and intention.",
  };

  return `${openerByTone[tone]}\n\n${body}\n\n${endingByFormat[format]}`;
};

const createId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const displayDate = (iso: string): string => {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Index = () => {
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("private-cloud");
  const [consentGranted, setConsentGranted] = useState(false);
  const [platformLinks, setPlatformLinks] = useState<Record<Platform, boolean>>({
    instagram: false,
    x: false,
    facebook: false,
  });

  const [snippets, setSnippets] = useState<StorySnippet[]>([]);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>("");

  const [manualSnippet, setManualSnippet] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [themeTag, setThemeTag] = useState("");
  const [peopleTag, setPeopleTag] = useState("");

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const speechRef = useRef<any>(null);

  const [tone, setTone] = useState<Tone>("introspective");
  const [format, setFormat] = useState<StoryFormat>("journal");
  const [isGenerating, setIsGenerating] = useState(false);

  const [draftsBySnippet, setDraftsBySnippet] = useState<Record<string, StoryDraft[]>>({});
  const [selectedDraftId, setSelectedDraftId] = useState<string>("");
  const [editorText, setEditorText] = useState("");
  const [compareLeftId, setCompareLeftId] = useState("");
  const [compareRightId, setCompareRightId] = useState("");

  useEffect(() => {
    const seeded: StorySnippet[] = [
      {
        id: createId(),
        text: "I visited my old school and unexpectedly met a teacher who remembered my first poem.",
        source: "manual",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        mood: "nostalgic",
        theme: "identity",
        people: "Ms. Fernandes",
      },
      {
        id: createId(),
        text: "Mom called just to ask if I had eaten, and I realized how care can hide in ordinary questions.",
        source: "voice",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        mood: "tender",
        theme: "belonging",
        people: "Mom",
      },
    ];

    setSnippets(seeded);
    setSelectedSnippetId(seeded[0].id);
  }, []);

  useEffect(() => {
    const maybeSpeech =
      typeof window !== "undefined" &&
      (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition;
    const maybeWebkit =
      typeof window !== "undefined" &&
      (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    setVoiceSupported(Boolean(maybeSpeech || maybeWebkit));
  }, []);

  const sortedSnippets = useMemo(() => {
    return [...snippets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [snippets]);

  const selectedSnippet = useMemo(
    () => snippets.find((snippet) => snippet.id === selectedSnippetId),
    [snippets, selectedSnippetId]
  );

  const selectedDrafts = useMemo(() => {
    if (!selectedSnippetId) return [];
    return draftsBySnippet[selectedSnippetId] || [];
  }, [draftsBySnippet, selectedSnippetId]);

  const selectedDraft = useMemo(() => {
    return selectedDrafts.find((draft) => draft.id === selectedDraftId);
  }, [selectedDrafts, selectedDraftId]);

  useEffect(() => {
    if (!selectedDrafts.length) {
      setSelectedDraftId("");
      setEditorText("");
      return;
    }

    const latest = selectedDrafts[selectedDrafts.length - 1];
    setSelectedDraftId(latest.id);
    setEditorText(latest.text);
    setCompareLeftId(selectedDrafts.length > 1 ? selectedDrafts[selectedDrafts.length - 2].id : latest.id);
    setCompareRightId(latest.id);
  }, [selectedSnippetId, selectedDrafts]);

  useEffect(() => {
    if (!selectedDraft) return;
    setEditorText(selectedDraft.text);
  }, [selectedDraft?.id]);

  const addSnippet = (source: SnippetSource, text: string, platform?: Platform) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    const nextSnippet: StorySnippet = {
      id: createId(),
      text: cleaned,
      source,
      createdAt: new Date().toISOString(),
      mood: moodTag.trim() || "reflective",
      theme: themeTag.trim() || "everyday meaning",
      people: peopleTag.trim() || "",
      socialPlatform: platform,
    };

    setSnippets((prev) => [nextSnippet, ...prev]);
    setSelectedSnippetId(nextSnippet.id);
    if (source === "manual") {
      setManualSnippet("");
    }
  };

  const togglePlatform = (platform: Platform) => {
    if (!consentGranted) return;
    setPlatformLinks((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const importSeed = (platform: Platform, seedText: string) => {
    if (!platformLinks[platform]) return;
    addSnippet("social", seedText, platform);
  };

  const startRecording = () => {
    const SpeechConstructor =
      (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechConstructor) return;

    const recognition = new SpeechConstructor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += `${event.results[i][0].transcript} `;
      }
      setVoiceText((prev) => `${prev} ${transcript}`.trim());
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    speechRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (speechRef.current) {
      speechRef.current.stop();
    }
    setIsRecording(false);
  };

  const generateDraft = async () => {
    if (!selectedSnippet) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const text = generateDraftText(selectedSnippet, format, tone);
    const soulCheck = buildSoulCheck(selectedSnippet, text);
    const draft: StoryDraft = {
      id: createId(),
      snippetId: selectedSnippet.id,
      format,
      tone,
      createdAt: new Date().toISOString(),
      text,
      soulCheck,
    };

    setDraftsBySnippet((prev) => ({
      ...prev,
      [selectedSnippet.id]: [...(prev[selectedSnippet.id] || []), draft],
    }));
    setSelectedDraftId(draft.id);
    setEditorText(draft.text);
    setIsGenerating(false);
  };

  const saveNewVersion = () => {
    if (!selectedSnippet || !editorText.trim()) return;

    const nextDraft: StoryDraft = {
      id: createId(),
      snippetId: selectedSnippet.id,
      format,
      tone,
      createdAt: new Date().toISOString(),
      text: editorText.trim(),
      soulCheck: buildSoulCheck(selectedSnippet, editorText),
    };

    setDraftsBySnippet((prev) => ({
      ...prev,
      [selectedSnippet.id]: [...(prev[selectedSnippet.id] || []), nextDraft],
    }));
    setSelectedDraftId(nextDraft.id);
  };

  const applyRefinement = (mode: "deeper" | "clearer" | "warmer") => {
    if (!selectedSnippet || !editorText.trim()) return;

    let refined = editorText.trim();
    if (mode === "deeper") {
      refined += "\n\nI am still learning what this says about me, but I know the feeling was real and it changed the way I speak to myself.";
    }
    if (mode === "clearer") {
      refined += `\n\nTo make the meaning explicit: this moment taught me something about ${selectedSnippet.theme || "who I am becoming"}.`;
    }
    if (mode === "warmer") {
      refined += "\n\nWhen I tell this story now, I notice less judgment and more kindness for the person I was in that moment.";
    }

    setEditorText(refined);
  };

  const comparison = useMemo(() => {
    const left = selectedDrafts.find((draft) => draft.id === compareLeftId);
    const right = selectedDrafts.find((draft) => draft.id === compareRightId);
    if (!left || !right) return null;

    const leftWords = tokenize(left.text).length;
    const rightWords = tokenize(right.text).length;

    return {
      left,
      right,
      delta: rightWords - leftWords,
    };
  }, [selectedDrafts, compareLeftId, compareRightId]);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(66,133,244,0.2),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(250,204,21,0.2),transparent_34%),radial-gradient(circle_at_20%_90%,rgba(16,185,129,0.12),transparent_40%),linear-gradient(160deg,#111827_0%,#1f2937_48%,#0f172a_100%)]" />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl" />

      <main className="relative mx-auto max-w-[1380px] px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-200">
              <BookOpen className="h-3.5 w-3.5" /> Soulful Story Weaver
            </p>
            <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">Turn moments into meaningful stories</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-200/85 sm:text-base">
              Capture life snippets, import social memories, narrate with your voice, and co-write with AI while checking
              emotional truth through Soul Check.
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur">
            <p className="font-semibold text-white">Privacy mode</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setPrivacyMode("private-cloud")}
                className={`rounded-md px-3 py-1.5 transition ${
                  privacyMode === "private-cloud" ? "bg-white text-slate-900" : "bg-white/15 text-white"
                }`}
              >
                Private Cloud
              </button>
              <button
                onClick={() => setPrivacyMode("offline")}
                className={`rounded-md px-3 py-1.5 transition ${
                  privacyMode === "offline" ? "bg-white text-slate-900" : "bg-white/15 text-white"
                }`}
              >
                Offline First
              </button>
            </div>
          </div>
        </motion.header>

        <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="space-y-4"
          >
            <article className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur">
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-200" />
                <h2 className="font-semibold text-white">Consent and Security</h2>
              </div>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-100">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(event) => setConsentGranted(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent"
                />
                <span>
                  I consent to using my snippets and optional social memory imports for story generation. Entries remain
                  private to this workspace.
                </span>
              </label>
              <p className="mt-3 text-xs text-slate-300">
                <Lock className="mr-1 inline h-3 w-3" />
                {privacyMode === "offline"
                  ? "Offline mode keeps generation local and avoids cloud calls."
                  : "Private cloud mode can use secure AI endpoints when connected."}
              </p>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-white">Social Story Seeds</h2>
                <Cloud className="h-4 w-4 text-sky-200" />
              </div>

              {(["instagram", "x", "facebook"] as Platform[]).map((platform) => (
                <div key={platform} className="mb-3 rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-semibold capitalize text-slate-100">
                      {platform === "instagram" ? <Instagram className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                      {platform}
                    </p>
                    <button
                      onClick={() => togglePlatform(platform)}
                      className={`rounded px-2.5 py-1 text-xs transition ${
                        platformLinks[platform] ? "bg-emerald-400 text-slate-900" : "bg-white/15 text-white"
                      }`}
                    >
                      {platformLinks[platform] ? "Connected" : "Connect"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {SOCIAL_SEEDS[platform].map((seed) => (
                      <button
                        key={seed}
                        onClick={() => importSeed(platform, seed)}
                        disabled={!platformLinks[platform]}
                        className="w-full rounded-md border border-white/10 bg-white/5 p-2 text-left text-xs text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {seed}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <PencilLine className="h-4 w-4" /> Manual Snippet
              </h2>
              <textarea
                value={manualSnippet}
                onChange={(event) => setManualSnippet(event.target.value)}
                placeholder="Describe a real-life moment in 1-3 sentences..."
                className="h-24 w-full rounded-md border border-white/15 bg-black/25 p-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <input
                  value={moodTag}
                  onChange={(event) => setMoodTag(event.target.value)}
                  placeholder="Mood"
                  className="rounded-md border border-white/15 bg-black/25 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-400"
                />
                <input
                  value={themeTag}
                  onChange={(event) => setThemeTag(event.target.value)}
                  placeholder="Theme"
                  className="rounded-md border border-white/15 bg-black/25 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-400"
                />
                <input
                  value={peopleTag}
                  onChange={(event) => setPeopleTag(event.target.value)}
                  placeholder="People"
                  className="rounded-md border border-white/15 bg-black/25 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => addSnippet("manual", manualSnippet)}
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
              >
                <Plus className="h-4 w-4" /> Add to timeline
              </button>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <AudioLines className="h-4 w-4" /> Voice Note Input
              </h2>
              {!voiceSupported && (
                <p className="mb-2 rounded-md border border-amber-200/35 bg-amber-100/20 px-2 py-1 text-xs text-amber-100">
                  Speech recognition is not available in this browser. Paste transcript manually below.
                </p>
              )}
              <textarea
                value={voiceText}
                onChange={(event) => setVoiceText(event.target.value)}
                placeholder="Record or paste your voice note transcript..."
                className="h-20 w-full rounded-md border border-white/15 bg-black/25 p-2.5 text-sm text-slate-100 placeholder:text-slate-400"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!voiceSupported && !isRecording}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRecording ? <Pause className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {isRecording ? "Stop" : "Record"}
                </button>
                <button
                  onClick={() => {
                    addSnippet("voice", voiceText);
                    setVoiceText("");
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-300 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-emerald-200"
                >
                  <ChevronRight className="h-3.5 w-3.5" /> Save as snippet
                </button>
              </div>
            </article>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="space-y-4"
          >
            <article className="rounded-2xl border border-white/15 bg-[#f5f4ef] p-4 text-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.24)] sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-3xl">Snippet Timeline</h2>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                  {sortedSnippets.length} entries
                </span>
              </div>
              <div className="grid gap-2.5 md:grid-cols-2">
                {sortedSnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => setSelectedSnippetId(snippet.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selectedSnippetId === snippet.id
                        ? "border-slate-900 bg-white shadow"
                        : "border-slate-300/70 bg-white/70 hover:bg-white"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{snippet.source}</p>
                      <p className="text-xs text-slate-500">{displayDate(snippet.createdAt)}</p>
                    </div>
                    <p className="line-clamp-3 text-sm leading-relaxed text-slate-800">{snippet.text}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                      <span className="rounded-full bg-slate-200 px-2 py-0.5">{snippet.mood}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5">{snippet.theme}</span>
                      {snippet.people && <span className="rounded-full bg-slate-200 px-2 py-0.5">{snippet.people}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/15 bg-[#f5f4ef] p-4 text-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.24)] sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-3xl">AI Story Generator</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={format}
                    onChange={(event) => setFormat(event.target.value as StoryFormat)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1.5"
                  >
                    <option value="short-story">Short Story</option>
                    <option value="journal">Reflective Journal</option>
                    <option value="summary">Narrative Summary</option>
                  </select>
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value as Tone)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1.5"
                  >
                    <option value="poetic">Poetic</option>
                    <option value="casual">Casual</option>
                    <option value="introspective">Introspective</option>
                    <option value="dramatic">Dramatic</option>
                  </select>
                  <button
                    onClick={generateDraft}
                    disabled={!selectedSnippet || isGenerating || !consentGranted}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <WandSparkles className="h-3.5 w-3.5" />
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>

              {!consentGranted && (
                <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Give consent in the left panel before generating stories.
                </p>
              )}

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-xl border border-slate-300 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Editor with version control</span>
                    <span>{selectedDrafts.length} versions</span>
                  </div>
                  <textarea
                    value={editorText}
                    onChange={(event) => setEditorText(event.target.value)}
                    placeholder="Generate a story from a snippet, then edit it here..."
                    className="h-[280px] w-full resize-none rounded-md border border-slate-300 p-3 text-sm leading-6 text-slate-800 focus:outline-none"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={saveNewVersion}
                      disabled={!editorText.trim() || !selectedSnippet}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
                    >
                      Save New Version
                    </button>
                    <button
                      onClick={() => applyRefinement("deeper")}
                      className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      More emotional depth
                    </button>
                    <button
                      onClick={() => applyRefinement("clearer")}
                      className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Clearer meaning
                    </button>
                    <button
                      onClick={() => applyRefinement("warmer")}
                      className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Warmer voice
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-300 bg-white p-3">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <BadgeCheck className="h-4 w-4 text-emerald-600" /> Soul Check
                    </h3>
                    {selectedDraft ? (
                      <>
                        <div className="space-y-2 text-xs text-slate-600">
                          <div>
                            <p className="mb-1">Intent alignment: {selectedDraft.soulCheck.intent}%</p>
                            <div className="h-2 rounded-full bg-slate-200">
                              <div className="h-2 rounded-full bg-sky-500" style={{ width: `${selectedDraft.soulCheck.intent}%` }} />
                            </div>
                          </div>
                          <div>
                            <p className="mb-1">Emotional authenticity: {selectedDraft.soulCheck.authenticity}%</p>
                            <div className="h-2 rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full bg-emerald-500"
                                style={{ width: `${selectedDraft.soulCheck.authenticity}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="mb-1">Human relatability: {selectedDraft.soulCheck.relatability}%</p>
                            <div className="h-2 rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full bg-amber-500"
                                style={{ width: `${selectedDraft.soulCheck.relatability}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-700">
                          Overall: {selectedDraft.soulCheck.overall}% ({scoreLabel(selectedDraft.soulCheck.overall)})
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-slate-700">
                          {selectedDraft.soulCheck.questions.map((question) => (
                            <p key={question}>- {question}</p>
                          ))}
                        </div>
                        <div className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                          {selectedDraft.soulCheck.guidance[0]}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">Generate a story to run Soul Check.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-300 bg-white p-3">
                    <h3 className="mb-2 text-sm font-semibold text-slate-800">Draft Versions</h3>
                    <div className="max-h-[180px] space-y-2 overflow-auto pr-1">
                      {selectedDrafts.map((draft, index) => (
                        <button
                          key={draft.id}
                          onClick={() => setSelectedDraftId(draft.id)}
                          className={`w-full rounded-md border p-2 text-left text-xs transition ${
                            selectedDraftId === draft.id
                              ? "border-slate-900 bg-slate-100"
                              : "border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <p className="font-semibold">Version {index + 1}</p>
                          <p className="text-slate-500">{displayDate(draft.createdAt)}</p>
                          <p className="text-slate-500">{draft.format} / {draft.tone}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-white/15 bg-[#f5f4ef] p-4 text-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.24)] sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-3xl">Version Compare</h2>
                <GitCompareArrows className="h-5 w-5" />
              </div>

              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                <select
                  value={compareLeftId}
                  onChange={(event) => setCompareLeftId(event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                >
                  {selectedDrafts.map((draft, index) => (
                    <option key={draft.id} value={draft.id}>
                      Left: Version {index + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={compareRightId}
                  onChange={(event) => setCompareRightId(event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                >
                  {selectedDrafts.map((draft, index) => (
                    <option key={draft.id} value={draft.id}>
                      Right: Version {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              {comparison ? (
                <>
                  <p className="mb-3 text-xs text-slate-600">
                    Word delta: {comparison.delta >= 0 ? `+${comparison.delta}` : comparison.delta} words from left to right.
                  </p>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-md border border-slate-300 bg-white p-3">
                      <p className="mb-2 text-xs font-semibold text-slate-600">Left Draft</p>
                      <p className="text-sm leading-6 text-slate-700">{comparison.left.text}</p>
                    </div>
                    <div className="rounded-md border border-slate-300 bg-white p-3">
                      <p className="mb-2 text-xs font-semibold text-slate-600">Right Draft</p>
                      <p className="text-sm leading-6 text-slate-700">{comparison.right.text}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600">Create at least two versions to compare drafts.</p>
              )}
            </article>
          </motion.section>
        </section>
      </main>
    </div>
  );
};

export default Index;
