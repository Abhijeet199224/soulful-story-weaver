import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, FileText, Plus } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  wordCount: number;
}

const initialChapters: Chapter[] = [
  { id: "1", title: "The Return", wordCount: 1240 },
  { id: "2", title: "Old Letters", wordCount: 870 },
  { id: "3", title: "The Market", wordCount: 0 },
  { id: "4", title: "Revelations", wordCount: 0 },
];

const ChapterSidebar = () => {
  const [chapters] = useState<Chapter[]>(initialChapters);
  const [activeChapter, setActiveChapter] = useState("1");

  return (
    <div className="flex h-full flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
        <BookOpen className="h-5 w-5 text-sidebar-primary" />
        <h2 className="font-display text-base font-semibold text-sidebar-foreground">Untitled Novel</h2>
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {chapters.map((ch, i) => (
          <motion.button
            key={ch.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveChapter(ch.id)}
            className={`group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-all ${
              activeChapter === ch.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="flex-1 truncate">
              <span className="font-medium">{ch.title}</span>
              {ch.wordCount > 0 && (
                <span className="ml-2 text-[10px] text-muted-foreground">{ch.wordCount}w</span>
              )}
            </div>
            <ChevronRight
              className={`h-3 w-3 text-muted-foreground transition-transform ${
                activeChapter === ch.id ? "rotate-90" : ""
              }`}
            />
          </motion.button>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-sidebar-border py-2 text-xs text-muted-foreground hover:border-sidebar-primary/40 hover:text-sidebar-foreground transition-all">
          <Plus className="h-3 w-3" />
          New Chapter
        </button>
      </div>
    </div>
  );
};

export default ChapterSidebar;
