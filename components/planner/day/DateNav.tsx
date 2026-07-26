"use client";

import { IconButton } from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";
import { WEEKDAY_INITIALS, WEEKDAY_NAMES } from "@/lib/dates";
import { cn } from "@/lib/cn";

/** Navegação do dia: setas, seletor de data, atalho de hoje e as iniciais D S T Q Q S S. */
export default function DateNav({
  date,
  weekday,
  isToday,
  onShift,
  onPick,
  onToday,
}: {
  date: string;
  weekday: number;
  isToday: boolean;
  /** Avança ou volta `delta` dias. */
  onShift: (delta: number) => void;
  /** Vai direto para uma data (YYYY-MM-DD). */
  onPick: (date: string) => void;
  onToday: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-2.5 sm:justify-end">
      <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface-soft p-1">
        <IconButton
          label="Dia anterior"
          onClick={() => onShift(-1)}
          className="h-8 w-8"
        >
          <ChevronLeft />
        </IconButton>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && onPick(e.target.value)}
          aria-label="Data"
          className="bg-transparent px-1 text-base font-medium tabular-nums text-ink outline-none sm:text-[0.9375rem]"
        />
        <IconButton
          label="Próximo dia"
          onClick={() => onShift(1)}
          className="h-8 w-8"
        >
          <ChevronRight />
        </IconButton>
      </div>

      {!isToday && (
        <Button variant="outline" size="sm" onClick={onToday}>
          Hoje
        </Button>
      )}

      <div className="flex shrink-0 items-center gap-1">
        {WEEKDAY_INITIALS.map((initial, i) => (
          <span
            key={i}
            title={WEEKDAY_NAMES[i]}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full text-[0.6875rem] font-medium transition-colors duration-200",
              i === weekday
                ? "bg-accent text-accent-on"
                : "bg-surface-soft text-faint",
            )}
          >
            {initial}
          </span>
        ))}
      </div>
    </div>
  );
}
