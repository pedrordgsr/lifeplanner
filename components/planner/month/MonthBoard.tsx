"use client";

import { useMemo, useState, useTransition } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import { StatRow } from "@/components/ui/Stat";
import { Plus } from "@/components/ui/Icons";
import HabitGrid from "./HabitGrid";
import HabitWheel from "./HabitWheel";
import ProgressChart from "./ProgressChart";
import TodayHabits from "./TodayHabits";
import {
  addHabit,
  copyHabitsFromPreviousMonth,
  removeHabit,
  saveHabitName,
  toggleHabitMark,
} from "@/app/(planner)/mes/actions";
import { MONTH_NAMES, WEEKDAY_NAMES, todayKey } from "@/lib/dates";
import { MAX_HABITS, type HabitItem } from "@/lib/habits";

/**
 * Estado do mês inteiro. Quantos hábitos o mês tem é escolha do usuário: a
 * lista vem do banco e cresce ou encolhe aqui. A entrada acontece em
 * TodayHabits (o dia corrente) e em HabitGrid (qualquer dia); a roda e o
 * gráfico apenas refletem o resultado.
 */
export default function MonthBoard({
  monthKey,
  year,
  month,
  days,
  initialHabits,
  initialMarks,
}: {
  monthKey: string;
  year: number;
  month: number;
  days: number;
  initialHabits: HabitItem[];
  initialMarks: string[];
}) {
  const [habits, setHabits] = useState(initialHabits);
  const [marks, setMarks] = useState(() => new Set(initialMarks));
  const [pending, startTransition] = useTransition();
  /** Slot recém-criado: o campo dele nasce em foco, pronto para o nome. */
  const [newSlot, setNewSlot] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [ty, tm, td] = todayKey().split("-").map(Number);
  const isCurrentMonth = ty === year && tm === month;
  const todayDay = isCurrentMonth ? td : null;

  const count = habits.length;

  const perDay = useMemo(() => {
    const counts = Array.from({ length: days }, () => 0);
    for (const key of marks) {
      const day = Number(key.split(":")[1]);
      if (day >= 1 && day <= days) counts[day - 1] += 1;
    }
    return counts;
  }, [marks, days]);

  const total = perDay.reduce((a, b) => a + b, 0);
  const rate = count ? Math.round((total / (count * days)) * 100) : 0;
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
    setHabits((prev) =>
      prev.map((h) => (h.slot === slot ? { ...h, name: value } : h)),
    );
  }

  function commitName(slot: number, value: string) {
    startTransition(async () => {
      await saveHabitName(monthKey, slot, value);
    });
  }

  function add() {
    if (count >= MAX_HABITS) return;
    setError("");
    startTransition(async () => {
      try {
        const criado = await addHabit(monthKey);
        setHabits((prev) => [...prev, criado]);
        setNewSlot(criado.slot);
      } catch {
        setError("Não deu para criar o hábito. Tente de novo.");
      }
    });
  }

  function remove(slot: number) {
    const habit = habits.find((h) => h.slot === slot);
    if (!habit) return;

    const temMarcas = Array.from(marks).some(
      (k) => Number(k.split(":")[0]) === slot,
    );
    const nome = habit.name.trim();
    if (
      (temMarcas || nome) &&
      !window.confirm(
        `Apagar “${nome || "hábito sem nome"}” deste mês? As marcações dele serão perdidas.`,
      )
    )
      return;

    const antes = habits;
    const marcasAntes = marks;
    setHabits((prev) => prev.filter((h) => h.slot !== slot));
    setMarks((prev) => {
      const next = new Set(prev);
      for (const k of prev) if (Number(k.split(":")[0]) === slot) next.delete(k);
      return next;
    });
    setError("");

    startTransition(async () => {
      try {
        await removeHabit(monthKey, slot);
      } catch {
        setHabits(antes);
        setMarks(marcasAntes);
        setError("Não deu para apagar o hábito. Tente de novo.");
      }
    });
  }

  function copyPrevious() {
    setError("");
    startTransition(async () => {
      try {
        setHabits(await copyHabitsFromPreviousMonth(monthKey));
      } catch {
        setError("Não deu para copiar do mês anterior.");
      }
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
          subtitle={
            count
              ? `${count} ${count === 1 ? "hábito" : "hábitos"} neste mês — adicione ou remova quando quiser.`
              : "Comece adicionando os hábitos deste mês."
          }
          aside={
            <button
              type="button"
              onClick={copyPrevious}
              disabled={pending}
              className="no-print rounded-full px-2 py-1 text-[0.6875rem] text-muted underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-accent-ink disabled:opacity-50"
            >
              copiar do mês anterior
            </button>
          }
        />

        {error && (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        {count === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">
              Nenhum hábito neste mês ainda.
            </p>
            <p className="mt-1 text-xs text-muted">
              Escolha quantos quiser — de um só a {MAX_HABITS}.
            </p>
            <Button
              onClick={add}
              disabled={pending}
              size="sm"
              className="no-print mt-5"
            >
              <Plus /> Adicionar hábito
            </Button>
          </div>
        ) : (
          <>
            {todayDay && (
              <TodayHabits
                habits={habits}
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
                habits={habits}
                days={days}
                marks={marks}
                todayDay={todayDay}
                autoFocusSlot={newSlot}
                onToggle={toggle}
                onRename={renameLocal}
                onCommitName={commitName}
                onRemove={remove}
              />

              <div className="no-print mt-3 flex flex-wrap items-center gap-3">
                <Button
                  onClick={add}
                  disabled={pending || count >= MAX_HABITS}
                  variant="outline"
                  size="sm"
                >
                  <Plus /> Adicionar hábito
                </Button>
                {count >= MAX_HABITS && (
                  <span className="text-[0.6875rem] text-faint">
                    máximo de {MAX_HABITS} por mês
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      {count > 0 && (
        /* `items-start`: cada cartão tem a altura do próprio conteúdo, sem vão. */
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* `min-w-0`: sem isso o item de grid cresce até o tamanho natural do
              SVG (640px) e estoura a tela no celular. */}
          <Card as="section" className="flex min-w-0 flex-col p-5 sm:p-8">
            <SectionTitle
              title="Roda do mês"
              subtitle={
                count === 1
                  ? "O anel mostra o mês inteiro."
                  : `Do anel externo ao interno, hábito 1 a ${count}.`
              }
            />
            <div className="mt-4 flex-1">
              <HabitWheel
                days={days}
                habits={habits}
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
              <ProgressChart
                perDay={perDay}
                days={days}
                todayDay={todayDay}
                max={count}
              />
            </div>
            <StatRow
              className="mt-6"
              items={[
                { label: "Melhor dia", value: `${best}/${count}` },
                { label: "Média", value: `${average.toFixed(1)}/${count}` },
                { label: "Dias ativos", value: activeDays },
              ]}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
