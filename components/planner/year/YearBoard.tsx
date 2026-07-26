"use client";

import { useState, useTransition } from "react";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import SavedFlag from "@/components/ui/SavedFlag";
import { StatRow } from "@/components/ui/Stat";
import MonthRow from "./MonthRow";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { saveMetas, toggleYearMark } from "@/app/(planner)/ano/actions";
import { MONTH_NAMES, daysInMonth, todayKey } from "@/lib/dates";

export default function YearBoard({
  year,
  initialMetas,
  initialMarks,
}: {
  year: number;
  initialMetas: string;
  initialMarks: string[];
}) {
  const [marks, setMarks] = useState(() => new Set(initialMarks));
  const [, startTransition] = useTransition();

  const metas = useAutosave(initialMetas, (value) => saveMetas(year, value));

  const [ty, tm, td] = todayKey().split("-").map(Number);
  const isCurrentYear = ty === year;

  const totalDays = Array.from({ length: 12 }, (_, i) =>
    daysInMonth(year, i + 1),
  ).reduce((a, b) => a + b, 0);

  function toggle(month: number, day: number) {
    const key = `${month}:${day}`;
    const next = new Set(marks);
    const willMark = !next.has(key);
    if (willMark) next.add(key);
    else next.delete(key);
    setMarks(next);

    startTransition(async () => {
      try {
        await toggleYearMark(year, month, day, willMark);
      } catch {
        setMarks((current) => {
          const revert = new Set(current);
          if (willMark) revert.delete(key);
          else revert.add(key);
          return revert;
        });
      }
    });
  }

  /** Sequência de dias marcados terminando hoje. */
  const streak = (() => {
    if (!isCurrentYear) return 0;
    let count = 0;
    const cursor = new Date(year, tm - 1, td);
    while (cursor.getFullYear() === year) {
      if (!marks.has(`${cursor.getMonth() + 1}:${cursor.getDate()}`)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  return (
    <div className="space-y-5">
      <Card className="p-6 sm:p-7">
        <SectionTitle
          title="Metas"
          subtitle={`O que você quer conquistar em ${year}.`}
          aside={<SavedFlag show={metas.saved} />}
        />
        <textarea
          value={metas.value}
          onChange={(e) => metas.setValue(e.target.value)}
          onBlur={metas.flush}
          rows={2}
          placeholder="Escreva em uma frase…"
          className="mt-4 w-full resize-none rounded-xl bg-transparent p-1.5 text-[0.9375rem] leading-relaxed outline-none transition-colors duration-200 placeholder:text-faint hover:bg-surface-soft focus:bg-surface-soft"
        />

        <StatRow
          className="mt-5"
          items={[
            { label: "Dias marcados", value: marks.size },
            {
              label: "Do ano",
              value: `${Math.round((marks.size / totalDays) * 100)}%`,
            },
            { label: "Sequência", value: streak },
          ]}
        />
      </Card>

      <Card as="section" className="divide-y divide-line p-2 sm:p-4">
        {MONTH_NAMES.map((name, i) => (
          <MonthRow
            key={name}
            name={name}
            month={i + 1}
            days={daysInMonth(year, i + 1)}
            marks={marks}
            isCurrentMonth={isCurrentYear && i + 1 === tm}
            todayDay={isCurrentYear && i + 1 === tm ? td : null}
            onToggle={toggle}
          />
        ))}
      </Card>
    </div>
  );
}
