"use client";

import { cn } from "@/lib/cn";
import Face, { RATING_LABELS } from "./Face";

/** Avaliação do dia: cinco carinhas, clique de novo para desmarcar. */
export default function MoodPicker({
  value,
  onPick,
}: {
  value: number | null;
  onPick: (level: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5">
      {[1, 2, 3, 4, 5].map((level) => {
        const active = value === level;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onPick(level)}
            aria-pressed={active}
            aria-label={RATING_LABELS[level - 1]}
            title={RATING_LABELS[level - 1]}
            className={cn(
              "h-12 w-12 rounded-full p-1 transition-all duration-200",
              active
                ? "bg-accent text-accent-on shadow-soft"
                : "text-faint hover:bg-accent-soft hover:text-accent",
            )}
          >
            <Face level={level} />
          </button>
        );
      })}
    </div>
  );
}
