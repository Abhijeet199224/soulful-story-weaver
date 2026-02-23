import { useState } from "react";
import { motion } from "framer-motion";
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left sidebar - Chapters */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden w-56 shrink-0 lg:block"
      >
        <ChapterSidebar />
      </motion.aside>

      {/* Main writing area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg font-semibold text-foreground">SoulScript</h1>
            <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary sm:inline-block">
              Novel Workspace
            </span>
          </div>
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
      </main>
    </div>
  );
};

export default Index;
