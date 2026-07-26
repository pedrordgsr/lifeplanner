"use client";

import { useMemo, useState, useTransition } from "react";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { StatRow } from "@/components/ui/Stat";
import HabitGrid from "./HabitGrid";
import HabitWheel from "./HabitWheel";
import ProgressChart from "./ProgressChart";
import TodayHabits from "./TodayHabits";
import {
  copyHabitsFromPreviousMonth,
  saveHabitName,
  toggleHabitMark,
} from "@/app/(planner)/mes/actions";
import { MONTH_NAMES, WEEKDAY_NAMES, todayKey } from "@/lib/dates";

/**
 * Estado do mês inteiro. A entrada acontece em TodayHabits (o dia corrente) e
 * em HabitGrid (qualquer dia); a roda e o gráfico apenas refletem o resultado.
 */
export default function MonthBoard({
  monthKey,
  year,
  month,
  days,
  initialNames,
  initialMarks,
}: {
  monthKey: string;
  year: number;
  month: number;
  days: number;
  initialNames: string[];
  initialMarks: string[];
}) {
  const [names, setNames] = useState(initialNames);
  const [marks, setMarks] = useState(() => new Set(initialMarks));
  const [, startTransition] = useTransition();

  const [ty, tm, td] = todayKey().split("-").map(Number);
  const isCurrentMonth = ty === year && tm === month;
  const todayDay = isCurrentMonth ? td : null;

  const perDay = useMemo(() => {
    const counts = Array.from({ length: days }, () => 0);
    for (const key of marks) {
      const day = Number(key.split(":")[1]);
      if (day >= 1 && day <= days) counts[day - 1] += 1;
    }
    return counts;
  }, [marks, days]);

  const total = perDay.reduce((a, b) => a + b, 0);
  const named = names.filter((n) => n.trim()).length;
  const rate = named ? Math.round((total / (named * days)) * 100) : 0;
  const best = Math.max(0, ...perDay);
  const activeDays = perDay.filter((v) => v > 0).length;
  const average = perDay.length ? total / perDay.length : 0;

  function toggle(slot: number, day: number) {
    const key = `${slot}:${day}`;
    const next = new Set(marks);
    const willBeDone = !next.has(key);
    if (willBeDone) next.add(key);
    else next.delete(key);
    setMarks(next);

    startTransition(async () => {
      try {
        await toggleHabitMark(monthKey, slot, day, willBeDone);
      } catch {
        setMarks((current) => {
          const revert = new Set(current);
          if (willBeDone) revert.delete(key);
          else revert.add(key);
          return revert;
        });
      }
    });
  }

  function renameLocal(slot: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === slot - 1 ? value : n)));
  }

  function commitName(slot: number, value: string) {
    startTransition(async () => {
      await saveHabitName(monthKey, slot, value);
    });
  }

  function copyPrevious() {
    startTransition(async () => {
      setNames(await copyHabitsFromPreviousMonth(monthKey));
    });
  }

  const todayLabel = todayDay
    ? `${WEEKDAY_NAMES[new Date(year, month - 1, todayDay).getDay()].toLowerCase()}, ${todayDay} de ${MONTH_NAMES[month - 1].toLowerCase()}`
    : "";

  return (
    <div className="space-y-5">
      <Card className="space-y-6 p-5 sm:p-8">
        <SectionTitle
          title="Hábitos"
          subtitle="Nomeie até sete e marque com um toque."
          aside={
            <button
              type="button"
              onClick={copyPrevious}
              className="no-print rounded-full px-2 py-1 text-[0.6875rem] text-muted underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-accent-ink"
            >
              copiar do mês anterior
            </button>
          }
        />

        {todayDay && (
          <TodayHabits
            names={names}
            marks={marks}
            day={todayDay}
            label={todayLabel}
            onToggle={toggle}
          />
        )}

        <div>
          <p className="label-eyebrow mb-3">
            {isCurrentMonth ? "O mês todo" : "Marque os dias"}
          </p>
          <HabitGrid
            names={names}
            days={days}
            marks={marks}
            todayDay={todayDay}
            onToggle={toggle}
            onRename={renameLocal}
            onCommitName={commitName}
          />
        </div>
      </Card>

      {/* `items-start`: cada cartão tem a altura do próprio conteúdo, sem vão. */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* `min-w-0`: sem isso o item de grid cresce até o tamanho natural do
            SVG (640px) e estoura a tela no celular. */}
        <Card as="section" className="flex min-w-0 flex-col p-5 sm:p-8">
          <SectionTitle
            title="Roda do mês"
            subtitle="Do anel externo ao interno, hábito 1 a 7."
          />
          <div className="mt-4 flex-1">
            <HabitWheel
              days={days}
              names={names}
              marks={marks}
              todayDay={todayDay}
              total={total}
            />
          </div>
          <StatRow
            className="mt-6"
            items={[
              { label: "Marcações", value: total },
              { label: "Aproveitamento", value: `${rate}%` },
            ]}
          />
        </Card>

        <Card as="section" className="flex min-w-0 flex-col p-5 sm:p-8">
          <SectionTitle
            title="Progresso do mês"
            subtitle="Quantos hábitos você cumpriu em cada dia."
          />
          <div className="mt-6 flex-1">
            <ProgressChart perDay={perDay} days={days} todayDay={todayDay} />
          </div>
          <StatRow
            className="mt-6"
            items={[
              { label: "Melhor dia", value: `${best}/7` },
              { label: "Média", value: `${average.toFixed(1)}/7` },
              { label: "Dias ativos", value: activeDays },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
