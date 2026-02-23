import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Save } from "lucide-react";
import { streamChat } from "@/lib/ai";
import { toast } from "sonner";

interface WritingEditorProps {
  soulLevel: number;
}

const INITIAL_TEXT = `The rain fell in thin silver threads, each one carrying the scent of earth and longing. Aria stood at the threshold of her grandmother's house, the door half-open like an unfinished sentence. She could hear the clock ticking inside — the same clock that had measured out the hours of her childhood summers.

The paint on the door was peeling now, revealing layers of color beneath, each one a different year, a different version of this home. She pressed her palm against the wood, feeling its warmth despite the rain. Somewhere inside, a kettle whistled — the sound so familiar it made her chest ache.

"You came," said a voice from the shadows of the hallway. It was Marcus, her uncle, standing with his hands in his pockets and a look on his face that was equal parts relief and grief.`;

const WritingEditor = ({ soulLevel }: WritingEditorProps) => {
  const [text, setText] = useState(INITIAL_TEXT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [text]);

  const handleGenerate = async () => {
    setIsGenerating(true);

    const toneDesc =
      soulLevel <= 30
        ? "deeply personal, emotional, and human"
        : soulLevel <= 70
        ? "a balanced blend of human warmth and structured prose"
        : "structured, descriptive, and polished";

    let generated = "";

    try {
      await streamChat({
        messages: [
          {
            role: "user",
            content: `Continue this story passage in a ${toneDesc} tone. Soul level: ${soulLevel}/100. Write 2-3 paragraphs. Do NOT repeat the existing text.\n\nCurrent text:\n${text}`,
          },
        ],
        mode: "generate",
        onDelta: (chunk) => {
          generated += chunk;
          setText((prev) => {
            // Only append on first chunk, then update the appended part
            if (generated === chunk) {
              return prev + "\n\n" + chunk;
            }
            // Replace everything after the original text
            const originalEnd = prev.length - (generated.length - chunk.length);
            return prev.slice(0, originalEnd) + chunk;
          });
        },
        onDone: () => {
          setIsGenerating(false);
          toast.success("AI content generated!");
        },
        onError: (err) => {
          toast.error(err);
          setIsGenerating(false);
        },
      });
    } catch {
      toast.error("Failed to generate content");
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Chapter 1: The Return
          </h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground">
            {wordCount} words
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success("Draft saved!")}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 glow-primary"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Writing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editable writing area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 rounded-lg border border-border bg-card"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing your story here..."
          disabled={isGenerating}
          className="h-full w-full resize-none rounded-lg bg-transparent p-6 font-body text-base leading-[1.9] text-card-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-70"
          spellCheck
        />
      </motion.div>

      {/* Status bar */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Soul Level: <strong className="text-primary">{soulLevel}%</strong>
          </span>
          <span>
            {soulLevel <= 30
              ? "Writing in your authentic voice"
              : soulLevel <= 70
              ? "AI collaborating with your style"
              : "AI taking the lead on prose"}
          </span>
        </div>
        <span>
          {isGenerating && "AI is writing..."}
        </span>
      </div>
    </div>
  );
};

export default WritingEditor;
