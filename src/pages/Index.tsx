import { useState } from "react";
import { motion } from "framer-motion";
import ChapterSidebar from "@/components/ChapterSidebar";
import WritingEditor from "@/components/WritingEditor";
import SoulCheckerSlider from "@/components/SoulCheckerSlider";
import CharacterPanel from "@/components/CharacterPanel";
import VoiceNoteRecorder from "@/components/VoiceNoteRecorder";
import SocialSnippets from "@/components/SocialSnippets";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

const Index = () => {
  const [soulLevel, setSoulLevel] = useState(40);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

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
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
        </div>

        {/* Editor + Right Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor area */}
          <motion.div
            layout
            className="flex-1 overflow-y-auto p-6"
          >
            <WritingEditor soulLevel={soulLevel} />
          </motion.div>

          {/* Right panel */}
          {rightPanelOpen && (
            <motion.aside
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 320 }}
              exit={{ opacity: 0, width: 0 }}
              className="w-80 shrink-0 overflow-y-auto border-l border-border bg-card/50"
            >
              <div className="space-y-6 p-5">
                {/* Soul Checker */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <SoulCheckerSlider value={soulLevel} onChange={setSoulLevel} />
                </motion.div>

                <div className="h-px bg-border" />

                {/* Characters */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Characters</h3>
                  <CharacterPanel />
                </motion.div>

                <div className="h-px bg-border" />

                {/* Voice Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Voice Notes</h3>
                  <VoiceNoteRecorder />
                </motion.div>

                <div className="h-px bg-border" />

                {/* Social Snippets */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <SocialSnippets />
                </motion.div>
              </div>
            </motion.aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
