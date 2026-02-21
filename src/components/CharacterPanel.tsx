import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, User } from "lucide-react";

interface Character {
  id: string;
  name: string;
  role: string;
  traits: string[];
  backstory: string;
}

const initialCharacters: Character[] = [
  {
    id: "1",
    name: "Aria",
    role: "Protagonist",
    traits: ["Resilient", "Curious", "Secretive"],
    backstory: "A journalist who discovers her family's hidden past through old letters.",
  },
  {
    id: "2",
    name: "Marcus",
    role: "Mentor",
    traits: ["Wise", "Burdened", "Loyal"],
    backstory: "Aria's uncle who holds the key to the family mystery.",
  },
];

const CharacterPanel = () => {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [selected, setSelected] = useState<string>("1");

  const active = characters.find((c) => c.id === selected);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {characters.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              selected === c.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <User className="h-3 w-3" />
            {c.name}
          </button>
        ))}
        <button className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {active && (
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4"
        >
          <div className="flex items-baseline justify-between">
            <h4 className="font-display text-lg font-semibold text-foreground">{active.name}</h4>
            <span className="text-xs text-primary">{active.role}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {active.traits.map((trait) => (
              <span
                key={trait}
                className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {trait}
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-secondary-foreground">{active.backstory}</p>
        </motion.div>
      )}
    </div>
  );
};

export default CharacterPanel;
