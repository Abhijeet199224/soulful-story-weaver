import { useState } from "react";
import { motion } from "framer-motion";

interface SoulCheckerSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const SoulCheckerSlider = ({ value, onChange }: SoulCheckerSliderProps) => {
  const humanPercent = 100 - value;
  const label =
    value === 0
      ? "Pure Human"
      : value === 100
      ? "Full AI"
      : value <= 30
      ? "Mostly You"
      : value <= 70
      ? "Collaborative"
      : "Mostly AI";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
          Soul Checker
        </h3>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {label}
        </span>
      </div>

      <div className="relative">
        <div className="soul-slider-track h-2 w-full rounded-full" />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>

      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span className="text-soul-human font-medium">Human {humanPercent}%</span>
        <span className="text-soul-ai font-medium">AI {value}%</span>
      </div>

      {value > 0 && value < 100 && (
        <motion.p
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          {value < 50
            ? "AI-generated parts will be highlighted for your review."
            : "Your emotional additions will be highlighted in the generated text."}
        </motion.p>
      )}
    </div>
  );
};

export default SoulCheckerSlider;
