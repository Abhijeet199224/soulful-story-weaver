import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Twitter, Link2, Plus } from "lucide-react";

interface Snippet {
  id: string;
  source: string;
  content: string;
  icon: "instagram" | "twitter" | "link";
}

const initialSnippets: Snippet[] = [
  {
    id: "1",
    source: "Instagram",
    content: "That rainy evening at the café where the old man told me stories about partition...",
    icon: "instagram",
  },
  {
    id: "2",
    source: "Twitter",
    content: "Thread about how smells trigger the most vivid childhood memories",
    icon: "twitter",
  },
];

const iconMap = {
  instagram: Instagram,
  twitter: Twitter,
  link: Link2,
};

const SocialSnippets = () => {
  const [snippets] = useState<Snippet[]>(initialSnippets);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">Life Snippets</h3>
        <button className="flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
          <Plus className="h-3 w-3" />
          Connect
        </button>
      </div>

      <div className="space-y-2">
        {snippets.map((snippet, i) => {
          const Icon = iconMap[snippet.icon];
          return (
            <motion.div
              key={snippet.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer rounded-lg border border-border bg-secondary/30 p-3 transition-all hover:border-primary/30"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-medium text-muted-foreground">{snippet.source}</span>
              </div>
              <p className="text-sm leading-relaxed text-secondary-foreground">{snippet.content}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialSnippets;
