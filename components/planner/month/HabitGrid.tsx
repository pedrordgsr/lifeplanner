"use client";

import { cn } from "@/lib/cn";
import { HABIT_COLORS } from "@/lib/theme";
import { InlineInput } from "@/components/ui/Field";

/**
 * Grade hábitos × dias: onde se nomeiam os hábitos e se preenche qualquer dia
 * do mês. É a entrada principal — a roda ao lado só mostra o resultado.
 */
export default function HabitGrid({
  names,
  days,
  marks,
  todayDay,
  onToggle,
  onRename,
  onCommitName,
}: {
  names: string[];
  days: number;
  marks: Set<string>;
  todayDay: number | null;
  onToggle: (slot: number, day: number) => void;
  onRename: (slot: number, value: string) => void;
  onCommitName: (slot: number, value: string) => void;
}) {
  const dayList = Array.from({ length: days }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[40rem]">
        {/* Cabeçalho com os dias */}
        <div className="flex items-end gap-3 pb-2">
          {/* Coluna dos nomes fica presa à esquerda ao rolar na horizontal.
              `self-stretch` dá altura ao vão para ele cobrir os números. */}
          <span className="sticky left-0 z-10 w-44 shrink-0 self-stretch bg-surface" />
          <div
            className="grid flex-1 gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))` }}
          >
            {dayList.map((day) => (
              <span
                key={day}
                className={cn(
                  "text-center text-[0.5625rem] tabular-nums",
                  todayDay === day
                    ? "font-semibold text-accent"
                    : "text-faint",
                )}
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Uma linha por hábito */}
        <div className="space-y-[3px]">
          {names.map((name, i) => {
            const slot = i + 1;
            const color = HABIT_COLORS[i];
            const count = dayList.reduce(
              (acc, day) => acc + (marks.has(`${slot}:${day}`) ? 1 : 0),
              0,
            );

            return (
              <div key={slot} className="flex items-center gap-3">
                <div className="sticky left-0 z-10 flex w-44 shrink-0 items-center gap-2 bg-surface">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                  <InlineInput
                    value={name}
                    maxLength={80}
                    placeholder={`Hábito ${slot}`}
                    aria-label={`Nome do hábito ${slot}`}
                    className="text-sm"
                    onChange={(e) => onRename(slot, e.target.value)}
                    onBlur={(e) => onCommitName(slot, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                  />
                  <span className="shrink-0 text-[0.625rem] tabular-nums text-faint">
                    {count}
                  </span>
                </div>

                <div
                  className="grid flex-1 gap-[3px]"
                  style={{
                    gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`,
                  }}
                >
                  {dayList.map((day) => {
                    const on = marks.has(`${slot}:${day}`);
                    const isToday = todayDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => onToggle(slot, day)}
                        aria-pressed={on}
                        aria-label={`${name.trim() || `Hábito ${slot}`}, dia ${day}`}
                        title={`${name.trim() || `Hábito ${slot}`} · dia ${day}`}
                        style={on ? { background: color } : undefined}
                        className={cn(
                          "h-6 rounded-[0.3rem] transition-all duration-150",
                          !on && "bg-surface-sunk hover:bg-accent-soft",
                          isToday &&
                            !on &&
                            "ring-1 ring-inset ring-accent/45",
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
