"use client";

import { cn } from "@/lib/cn";
import { HABIT_COLORS } from "@/lib/theme";
import { Check } from "@/components/ui/Icons";

/**
 * Entrada do dia a dia: um toque por hábito, sem procurar célula nenhuma.
 * Só aparece quando o mês na tela é o mês corrente.
 */
export default function TodayHabits({
  names,
  marks,
  day,
  label,
  onToggle,
}: {
  names: string[];
  marks: Set<string>;
  day: number;
  /** Ex.: "domingo, 26 de julho" */
  label: string;
  onToggle: (slot: number, day: number) => void;
}) {
  const doneCount = names.reduce(
    (acc, _, i) => acc + (marks.has(`${i + 1}:${day}`) ? 1 : 0),
    0,
  );

  return (
    <div className="rounded-2xl bg-surface-sunk p-4 sm:p-5">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="label-eyebrow">Hoje · {label}</p>
        <p className="text-xs text-muted">
          <strong className="font-semibold tabular-nums text-ink">
            {doneCount}
          </strong>{" "}
          de {names.length}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {names.map((name, i) => {
          const slot = i + 1;
          const on = marks.has(`${slot}:${day}`);
          const color = HABIT_COLORS[i];

          return (
            <button
              key={slot}
              type="button"
              onClick={() => onToggle(slot, day)}
              aria-pressed={on}
              className={cn(
                "group inline-flex items-center gap-2 rounded-full border py-2 pl-2.5 pr-4",
                "text-sm transition-all duration-200",
                on
                  ? "border-transparent text-accent-on"
                  : "border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-accent-soft",
              )}
              style={on ? { background: color } : undefined}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full transition-colors duration-200",
                  on ? "bg-accent-on/25 text-accent-on" : "text-transparent",
                )}
                style={
                  on
                    ? undefined
                    : {
                        background: `color-mix(in srgb, ${color} 15%, transparent)`,
                      }
                }
              >
                <Check />
              </span>
              {name.trim() || `Hábito ${slot}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
