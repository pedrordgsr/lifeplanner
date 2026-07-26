"use client";

import { cn } from "@/lib/cn";
import { YEAR_MARK } from "@/lib/theme";

/** Um mês do Mapa do Ano: rótulo, contagem e um círculo por dia. */
export default function MonthRow({
  name,
  month,
  days,
  marks,
  isCurrentMonth,
  todayDay,
  onToggle,
}: {
  name: string;
  month: number;
  days: number;
  marks: Set<string>;
  isCurrentMonth: boolean;
  todayDay: number | null;
  onToggle: (month: number, day: number) => void;
}) {
  const marked = Array.from({ length: days }, (_, d) =>
    marks.has(`${month}:${d + 1}`),
  );
  const count = marked.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-2.5 px-2 py-3.5 sm:flex-row sm:items-center sm:gap-5 sm:px-3">
      <div className="flex w-36 shrink-0 items-baseline justify-between gap-3 sm:flex-col sm:items-start sm:gap-1">
        <span
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200",
            isCurrentMonth
              ? "bg-accent-soft font-medium text-accent-ink"
              : "text-ink-soft",
          )}
        >
          {name}
        </span>
        <span className="pl-1 text-[0.6875rem] tabular-nums text-faint">
          {count}/{days}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {marked.map((on, d) => {
          const day = d + 1;
          const isToday = todayDay === day && isCurrentMonth;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onToggle(month, day)}
              aria-pressed={on}
              aria-label={`${day} de ${name}`}
              style={on ? { background: YEAR_MARK } : undefined}
              className={cn(
                // Alvo maior no celular; volta a 26px onde há mouse.
                "h-[30px] w-[30px] rounded-full text-[0.6875rem] tabular-nums transition-all duration-200 sm:h-[26px] sm:w-[26px] sm:text-[0.625rem]",
                on
                  ? "font-medium text-accent-on"
                  : "bg-surface-sunk text-faint hover:bg-accent-soft hover:text-accent-ink",
                !on && isToday && "ring-1 ring-accent ring-inset text-accent",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
