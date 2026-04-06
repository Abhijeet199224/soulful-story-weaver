import { useMemo, useState } from "react";
import { motion } from "framer-motion";
<<<<<<< HEAD
import ChapterSidebar from "@/components/ChapterSidebar";
import WritingEditor from "@/components/WritingEditor";
import SoulCheckerSlider from "@/components/SoulCheckerSlider";
import CharacterPanel from "@/components/CharacterPanel";
import VoiceNoteRecorder from "@/components/VoiceNoteRecorder";
import SocialSnippets from "@/components/SocialSnippets";
import AIStoryAssistant from "@/components/AIStoryAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { PanelRightClose, PanelRightOpen, Bot, LogOut, Layers } from "lucide-react";

type RightTab = "tools" | "ai";

const Index = () => {
  const [soulLevel, setSoulLevel] = useState(40);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>("tools");
  const { signOut, user } = useAuth();
=======
import { Search, Sparkles, Star, X } from "lucide-react";

interface LoreContact {
  id: string;
  name: string;
  subtitle: string;
  initials: string;
}

const contacts: LoreContact[] = [
  { id: "1", name: "Rid Title", subtitle: "Torc Smale", initials: "RT" },
  { id: "2", name: "Ciele", subtitle: "Tnicat Prendring", initials: "CI" },
  { id: "3", name: "Toned", subtitle: "Best Rliter", initials: "TO" },
  { id: "4", name: "Eromand", subtitle: "Bactineter", initials: "ER" },
];

const Index = () => {
  const [soulLevel, setSoulLevel] = useState(42);

  const soulLabel = useMemo(() => {
    if (soulLevel <= 25) return "Human-heavy draft";
    if (soulLevel <= 60) return "Balanced collaboration";
    return "AI-heavy draft";
  }, [soulLevel]);
>>>>>>> c2e382a (Updates)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a121d] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(24,119,156,0.25),transparent_42%),radial-gradient(circle_at_85%_16%,rgba(251,191,36,0.16),transparent_33%),linear-gradient(120deg,#060b12,#10243a_45%,#0b1829)]" />
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-[1220px] flex-col px-4 pb-8 pt-6 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-center gap-3"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/30">
            <Sparkles className="h-4 w-4" />
          </div>
<<<<<<< HEAD
          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden text-xs text-muted-foreground sm:inline-block">
                {user.email}
              </span>
            )}
            <button
              onClick={signOut}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Editor + Right Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor area */}
          <motion.div layout className="flex-1 overflow-y-auto p-6">
            <WritingEditor soulLevel={soulLevel} />
          </motion.div>

          {/* Right panel */}
          {rightPanelOpen && (
            <motion.aside
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 360 }}
              exit={{ opacity: 0, width: 0 }}
              className="flex w-[360px] shrink-0 flex-col overflow-hidden border-l border-border bg-card/50"
            >
              {/* Tab switcher */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setRightTab("tools")}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
                    rightTab === "tools"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Tools
                </button>
                <button
                  onClick={() => setRightTab("ai")}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
                    rightTab === "ai"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" />
                  AI Assistant
                </button>
              </div>

              {rightTab === "tools" ? (
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-6 p-5">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <SoulCheckerSlider value={soulLevel} onChange={setSoulLevel} />
                    </motion.div>
                    <div className="h-px bg-border" />
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Characters</h3>
                      <CharacterPanel />
                    </motion.div>
                    <div className="h-px bg-border" />
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Voice Notes</h3>
                      <VoiceNoteRecorder />
                    </motion.div>
                    <div className="h-px bg-border" />
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <SocialSnippets />
                    </motion.div>
                  </div>
                </div>
              ) : (
                <AIStoryAssistant />
              )}
            </motion.aside>
          )}
        </div>
=======
          <h1 className="font-display text-3xl tracking-tight text-slate-100 sm:text-4xl">Narrative Nexus</h1>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-slate-300 sm:px-6">
            <div className="flex items-center gap-6">
              <span className="font-semibold text-slate-100">Lore-Loom</span>
              <span className="text-slate-300">Zen Canvas</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <Star className="h-4 w-4" />
              <X className="h-4 w-4" />
            </div>
          </div>

          <div className="grid min-h-[640px] grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="border-b border-white/10 bg-gradient-to-b from-slate-950/70 to-slate-900/50 p-3 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-4">
              <div className="relative mb-3">
                <input
                  value="Livsteiv"
                  readOnly
                  className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-sm text-slate-200 outline-none"
                />
                <Search className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-500" />
              </div>

              <div className="space-y-2">
                {contacts.map((contact, i) => (
                  <motion.button
                    key={contact.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i }}
                    className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/[0.06] p-2.5 text-left transition-colors hover:bg-white/[0.09]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-xs font-semibold text-slate-900">
                      {contact.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{contact.name}</p>
                      <p className="text-xs text-slate-400">{contact.subtitle}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </aside>

            <div className="flex flex-col bg-[#f8f8f7] text-slate-900">
              <article className="relative flex-1 px-6 pb-16 pt-12 sm:px-10 sm:pt-14">
                <h2 className="mb-5 font-display text-3xl text-slate-800">Zen Canvas</h2>
                <div className="max-w-[58ch] space-y-4 font-serif text-[1.08rem] leading-8 text-slate-700">
                  <p>
                    Rain leaned against the city like an old memory that refused to blur. At the threshold, she paused,
                    listening to floorboards breathe and brass hinges hold their breath for her next choice.
                  </p>
                  <p>
                    The hallway smelled of tea leaves, wet paper, and something she had no name for, something that
                    felt like being recognized by a place before introducing yourself.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="absolute bottom-8 left-1/2 w-[88%] max-w-[370px] -translate-x-1/2 rounded-xl border border-amber-500/70 bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.18)]"
                >
                  <p className="font-body text-lg font-semibold text-slate-800">Soul-Check Required</p>
                  <p className="mt-2 text-sm text-slate-600">Can you add a more emotional question or detail here?</p>
                </motion.div>
              </article>

              <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-4 sm:px-8">
                <div className="flex min-w-[250px] flex-1 items-center gap-3">
                  <span className="text-lg text-slate-500">H</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={soulLevel}
                    onChange={(event) => setSoulLevel(Number(event.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-slate-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{soulLabel}</span>
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
                    Generate
                  </button>
                </div>
              </footer>
            </div>
          </div>
        </motion.section>
>>>>>>> c2e382a (Updates)
      </main>
    </div>
  );
};

export default Index;
