import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookHeart, EyeOff, Gauge, Lock, ShieldCheck, Sparkles } from "lucide-react";

const detectPrivacyFlags = (text: string): string[] => {
  const flags: string[] = [];
  if (!text.trim()) return flags;

  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const phone = /(\+\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s-]?)\d{3}[\s-]?\d{4}/;
  const url = /https?:\/\//i;
  const idLike = /\b\d{8,16}\b/;
  const locationTerms = /(home address|street|apartment|flat|passport|bank|ssn|aadhaar|pan|license)/i;

  if (email.test(text)) flags.push("Contains an email address that can identify you.");
  if (phone.test(text)) flags.push("Contains a phone number.");
  if (url.test(text)) flags.push("Contains a direct external link.");
  if (idLike.test(text)) flags.push("Contains long numeric string that may be sensitive.");
  if (locationTerms.test(text)) flags.push("Contains location or identity-sensitive wording.");

  return flags;
};

const readabilityScore = (text: string): number => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;

  const sentences = text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean);
  const avgSentenceLength = words.length / Math.max(1, sentences.length);
  const longWords = words.filter((word) => word.length >= 9).length;

  let score = 95;
  score -= Math.min(45, avgSentenceLength * 1.4);
  score -= Math.min(20, (longWords / words.length) * 100 * 0.35);
  return Math.max(12, Math.round(score));
};

const publicationReadiness = (text: string): { score: number; notes: string[] } => {
  const notes: string[] = [];
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (words.length < 80) notes.push("Expand with concrete details; this draft is still thin.");
  if (!/["“”]/.test(text)) notes.push("Dialogue variety is low; add character voice where relevant.");
  if (!/(felt|remembered|feared|wanted|wondered|noticed)/i.test(text)) {
    notes.push("Interior emotion is weak; add inner conflict lines.");
  }

  const privacyFlags = detectPrivacyFlags(text);
  if (privacyFlags.length > 0) {
    notes.push("Sensitive content detected. Anonymize names, locations, and identifiers.");
  }

  const readability = readabilityScore(text);
  const score = Math.max(20, Math.min(100, Math.round((readability * 0.65) + (Math.min(words.length, 700) / 700) * 35)));

  if (notes.length === 0) notes.push("Strong structure. Focus on rhythm and line-level polish before publishing.");

  return { score, notes };
};

const fatigueHeat = (text: string): Array<{ segment: string; load: number }> => {
  const chunks = text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 10);

  return chunks.map((segment) => {
    const words = segment.split(/\s+/).filter(Boolean);
    const commas = (segment.match(/,/g) || []).length;
    const longWords = words.filter((word) => word.length >= 8).length;
    const load = Math.min(100, Math.round((words.length * 2.3) + (commas * 8) + (longWords * 1.5)));
    return { segment, load };
  });
};

const Tier = ({
  title,
  price,
  points,
  accent,
}: {
  title: string;
  price: string;
  points: string[];
  accent: string;
}) => (
  <article className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
    <p className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${accent}`}>{title}</p>
    <p className="mt-3 font-display text-4xl text-slate-900">{price}</p>
    <div className="mt-3 space-y-1.5 text-sm text-slate-700">
      {points.map((point) => (
        <p key={point}>- {point}</p>
      ))}
    </div>
  </article>
);

const Index = () => {
  const [analysisText, setAnalysisText] = useState("");

  const privacyFlags = useMemo(() => detectPrivacyFlags(analysisText), [analysisText]);
  const publishReport = useMemo(() => publicationReadiness(analysisText), [analysisText]);
  const fatigue = useMemo(() => fatigueHeat(analysisText), [analysisText]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#ece7dc] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(14,165,233,0.14),transparent_35%),radial-gradient(circle_at_80%_6%,rgba(251,191,36,0.15),transparent_30%),linear-gradient(180deg,#efe9dc_0%,#f5f2ea_45%,#f8f7f2_100%)]" />
      <div className="relative mx-auto max-w-[1250px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-300/80 bg-white/80 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4" /> Soulful Story Weaver
            </p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-600">
              <span className="rounded-full border border-slate-400 px-2 py-1">Zero-Knowledge Style</span>
              <span className="rounded-full border border-slate-400 px-2 py-1">Local-First Drafting</span>
            </div>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <h1 className="font-display text-5xl leading-[1.05] text-slate-900 sm:text-6xl">
                Private writing workspace for books, journals, and raw first drafts.
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-700">
                Build manuscripts with AI support while retaining your author voice. Run privacy risk checks, publish-readiness
                analysis, and reader-fatigue prediction in one secure experience.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to="/workspace"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Open Writing Vault <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/characters"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-400 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  Build Characters
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-slate-900 p-4 text-slate-100">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Cipher-style security posture</p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Client-side key model ready</p>
                <p className="inline-flex items-center gap-2"><EyeOff className="h-4 w-4" /> No raw text required on server</p>
                <p className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI tools with human override</p>
              </div>
              <p className="mt-3 rounded-lg bg-white/10 p-2 text-xs text-slate-200">
                Positioning: AI for boring transitions. Human voice for emotional truth.
              </p>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-300 bg-white p-4 lg:col-span-3">
            <h2 className="mb-2 font-display text-3xl text-slate-900">Start Writing Block</h2>
            <p className="text-sm text-slate-700">
              Jump straight into writing with formatting controls (bold, italic, heading, quote, list) in the workspace editor.
            </p>
            <Link
              to="/workspace"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Start Writing Now <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <article className="rounded-2xl border border-slate-300 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-2 font-semibold"><BookHeart className="h-4 w-4" /> Novel Drafting</h2>
            <p className="text-sm text-slate-700">Project, character, plot, chapter and moments pages designed for long-form storytelling.</p>
          </article>
          <article className="rounded-2xl border border-slate-300 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> Privacy Analyzer</h2>
            <p className="text-sm text-slate-700">Detect oversharing risk before publishing personal experiences, memoirs, or travel journals.</p>
          </article>
          <article className="rounded-2xl border border-slate-300 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4" /> Reader Fatigue Map</h2>
            <p className="text-sm text-slate-700">Find high cognitive-load passages and smooth pacing to keep readers engaged.</p>
          </article>
        </section>

        <section className="mb-8 rounded-3xl border border-slate-300 bg-white p-5">
          <h2 className="font-display text-4xl text-slate-900">Live Analysis Tools</h2>
          <p className="mt-1 text-sm text-slate-600">Paste a draft excerpt below to preview key checks.</p>

          <textarea
            value={analysisText}
            onChange={(event) => setAnalysisText(event.target.value)}
            placeholder="Paste your scene, chapter excerpt, or journal entry..."
            className="mt-4 h-48 w-full rounded-xl border border-slate-300 bg-[#f8f6f1] p-3 text-sm leading-6 focus:outline-none"
          />

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <article className="rounded-xl border border-slate-300 bg-[#fffefb] p-3">
              <h3 className="text-sm font-semibold text-slate-900">Privacy Risk</h3>
              {privacyFlags.length === 0 ? (
                <p className="mt-2 text-sm text-emerald-700">No obvious personal identifiers detected.</p>
              ) : (
                <div className="mt-2 space-y-1 text-sm text-amber-800">
                  {privacyFlags.map((flag) => (
                    <p key={flag}>- {flag}</p>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-xl border border-slate-300 bg-[#fffefb] p-3">
              <h3 className="text-sm font-semibold text-slate-900">Publish Readiness</h3>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{publishReport.score}%</p>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                {publishReport.notes.map((note) => (
                  <p key={note}>- {note}</p>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-slate-300 bg-[#fffefb] p-3">
              <h3 className="text-sm font-semibold text-slate-900">Reader Fatigue Predictor</h3>
              {fatigue.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">Add at least one sentence to calculate fatigue heat.</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {fatigue.slice(0, 4).map((item, index) => (
                    <div key={`${item.segment}-${index}`}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-slate-600">Segment {index + 1}</span>
                        <span className="font-semibold text-slate-800">{item.load}% load</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className={`h-2 rounded-full ${item.load > 70 ? "bg-rose-500" : item.load > 45 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${item.load}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-slate-300 bg-white p-5">
          <h2 className="font-display text-4xl text-slate-900">Pricing</h2>
          <p className="mt-1 text-sm text-slate-600">Launch-ready tier structure similar to modern secure writing SaaS products.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Tier
              title="Initiate"
              price="$0"
              accent="bg-slate-100 text-slate-700"
              points={["Local drafts", "Basic privacy checks", "Markdown editor", "1 active project"]}
            />
            <Tier
              title="Essential"
              price="$5/mo"
              accent="bg-emerald-100 text-emerald-800"
              points={["Cross-device sync", "Unlimited projects", "Priority AI drafting", "500+ chapters"]}
            />
            <Tier
              title="Pro"
              price="$11/mo"
              accent="bg-amber-100 text-amber-800"
              points={["Manuscript auditor", "Theme packs", "Advanced soul report", "Early feature access"]}
            />
            <Tier
              title="Enterprise"
              price="$99/mo"
              accent="bg-sky-100 text-sky-800"
              points={["Dedicated infra", "Custom deployment", "Security controls", "SLA + support"]}
            />
          </div>
        </section>

        <footer className="rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-600">
          <p>
            Built for private authorship: draft your novel with AI acceleration, then humanize key moments before publishing.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link to="/workspace" className="font-semibold text-slate-800 underline">Launch workspace</Link>
            <Link to="/soul-report" className="font-semibold text-slate-800 underline">Open soul report</Link>
            <Link to="/moments" className="font-semibold text-slate-800 underline">Attach real-life moments</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
