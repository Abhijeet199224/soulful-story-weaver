import { useState, Fragment } from "react";
import { motion } from "framer-motion";
import { Sparkles, PenLine } from "lucide-react";

interface TextSegment {
  text: string;
  type: "human" | "ai" | "editable";
}

interface WritingEditorProps {
  soulLevel: number;
}

const generateContent = (soulLevel: number): TextSegment[] => {
  if (soulLevel === 0) {
    return [
      { text: "The rain fell in thin silver threads, each one carrying the scent of earth and longing. Aria stood at the threshold of her grandmother's house, the door half-open like an unfinished sentence. She could hear the clock ticking inside — the same clock that had measured out the hours of her childhood summers.", type: "human" },
    ];
  }
  if (soulLevel === 100) {
    return [
      { text: "The precipitation descended upon the metropolitan landscape, creating a symphony of aqueous percussion against the aged terracotta tiles. The protagonist approached the ancestral dwelling with measured steps, her cognitive processes oscillating between anticipation and apprehension.", type: "ai" },
    ];
  }
  if (soulLevel <= 30) {
    return [
      { text: "The rain fell in thin silver threads, each one carrying the scent of earth and longing. ", type: "human" },
      { text: "Aria's footsteps echoed on the wet stone pathway leading to the house.", type: "editable" },
      { text: " She could hear the clock ticking inside — the same clock that had measured out the hours of her childhood summers. The paint on the door was peeling now, revealing layers of color beneath, each one a different year, a different version of this home.", type: "human" },
    ];
  }
  if (soulLevel <= 70) {
    return [
      { text: "The rain fell softly, ", type: "human" },
      { text: "each droplet a whispered memory dissolving into the earth below.", type: "editable" },
      { text: " Aria stood before the house, its wooden frame weathered by decades of monsoons. ", type: "human" },
      { text: "The door stood ajar, as though the house itself had been waiting for her return, breathing in the damp evening air with quiet expectation.", type: "editable" },
      { text: " Inside, the clock ticked its ancient rhythm.", type: "human" },
    ];
  }
  return [
    { text: "The atmospheric conditions produced a steady downpour that ", type: "ai" },
    { text: "reminded her of that evening in the café", type: "editable" },
    { text: ". Aria navigated toward the residential structure, her neural pathways firing with recollective impulses. ", type: "ai" },
    { text: "She could almost taste grandma's chai on her tongue.", type: "editable" },
    { text: " The temporal measurement device within continued its rhythmic oscillation, marking the passage of moments both cherished and forgotten.", type: "ai" },
  ];
};

const WritingEditor = ({ soulLevel }: WritingEditorProps) => {
  const [content, setContent] = useState<TextSegment[]>(() => generateContent(soulLevel));
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setContent(generateContent(soulLevel));
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Chapter 1: The Return</h2>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 glow-primary"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </div>

      <motion.div
        key={soulLevel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 rounded-lg border border-border bg-card p-6 font-body text-base leading-[1.9] text-card-foreground"
      >
        {content.map((segment, i) => (
          <Fragment key={i}>
            {segment.type === "editable" ? (
              <span className="highlight-editable group relative inline" title="Click to edit — add your emotion here">
                {segment.text}
                <PenLine className="ml-1 inline h-3 w-3 text-highlight-edit opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            ) : segment.type === "ai" ? (
              <span className="text-muted-foreground">{segment.text}</span>
            ) : (
              <span>{segment.text}</span>
            )}
          </Fragment>
        ))}
      </motion.div>

      {soulLevel > 0 && soulLevel < 100 && (
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-foreground" /> Your writing
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-highlight-edit" /> Edit to add emotion
          </span>
          {soulLevel > 70 && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" /> AI generated
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WritingEditor;
