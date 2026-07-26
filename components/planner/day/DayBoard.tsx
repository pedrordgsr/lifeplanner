"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import PageHeader from "@/components/layout/PageHeader";
import TaskList from "./TaskList";
import NotesCard from "./NotesCard";
import MoodPicker from "./MoodPicker";
import DateNav from "./DateNav";
import { RATING_LABELS } from "./Face";
import { useAutosave } from "@/lib/hooks/useAutosave";
import {
  carryOverPending,
  saveNotes,
  saveRating,
  type Task,
} from "@/app/(planner)/dia/actions";
import {
  WEEKDAY_NAMES,
  formatLongDate,
  shiftDate,
  todayKey,
  weekdayOf,
} from "@/lib/dates";

export default function DayBoard({
  date,
  initialNotes,
  initialRating,
  initialTasks,
}: {
  date: string;
  initialNotes: string;
  initialRating: number | null;
  initialTasks: Task[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [rating, setRating] = useState(initialRating);
  const [, startTransition] = useTransition();

  const notes = useAutosave(initialNotes, (value) => saveNotes(date, value));

  const weekday = weekdayOf(date);
  const isToday = date === todayKey();
  const done = tasks.filter((t) => t.done).length;
  const pending = tasks.length - done;

  const go = (target: string) => router.push(`/dia?d=${target}`);

  function pickRating(level: number) {
    const next = rating === level ? null : level;
    setRating(next);
    startTransition(async () => {
      await saveRating(date, next);
    });
  }

  function carryOver() {
    const tomorrow = shiftDate(date, 1);
    startTransition(async () => {
      const moved = await carryOverPending(date, tomorrow);
      if (moved > 0) go(tomorrow);
    });
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Planner diário"
        title={WEEKDAY_NAMES[weekday]}
        subtitle={
          <>
            {formatLongDate(date)}
            {isToday && " · hoje"}
          </>
        }
        actions={
          <DateNav
            date={date}
            weekday={weekday}
            isToday={isToday}
            onShift={(delta) => go(shiftDate(date, delta))}
            onPick={go}
            onToday={() => go(todayKey())}
          />
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        {/* `min-w-0` impede o item de grid de crescer além da tela;
            sem altura mínima no celular, o cartão fica do tamanho do conteúdo. */}
        <Card
          as="section"
          className="flex min-w-0 flex-col p-5 sm:min-h-[27rem] sm:p-7"
        >
          <SectionTitle
            title="Tarefas"
            aside={
              <span className="tabular-nums">
                {done}/{tasks.length} concluídas
              </span>
            }
          />
          <div className="mt-5 flex flex-1 flex-col">
            <TaskList
              date={date}
              kind="normal"
              tasks={tasks}
              setTasks={setTasks}
              placeholder="Adicionar tarefa…"
              emptyHint="Nada por aqui ainda."
            />
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card as="section" className="flex flex-col p-5 sm:min-h-[14rem] sm:p-6">
            <SectionTitle
              title="Inegociáveis"
              subtitle="O que sustenta o dia."
            />
            <div className="mt-5 flex flex-1 flex-col">
              <TaskList
                date={date}
                kind="inegociavel"
                tasks={tasks}
                setTasks={setTasks}
                placeholder="O essencial de hoje…"
                emptyHint="Escolha uma ou duas."
              />
            </div>
          </Card>

          <NotesCard
            title="Notas"
            className="flex-1"
            value={notes.value}
            saved={notes.saved}
            onChange={notes.setValue}
            onFlush={notes.flush}
            placeholder="Ideias, lembretes, aprendizados…"
          />
        </div>
      </div>

      <Card
        as="section"
        tone="soft"
        className="flex flex-wrap items-center justify-between gap-5 px-6 py-5 sm:px-7"
      >
        <SectionTitle
          title="Avaliação do dia"
          subtitle={
            rating
              ? RATING_LABELS[rating - 1]
              : "Como foi? Toque em uma carinha."
          }
        />
        <MoodPicker value={rating} onPick={pickRating} />
      </Card>

      {pending > 0 && (
        <p className="no-print text-center text-xs text-muted">
          {pending} {pending === 1 ? "tarefa pendente" : "tarefas pendentes"} ·{" "}
          <button
            type="button"
            onClick={carryOver}
            className="underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-accent-ink"
          >
            mover para amanhã
          </button>
        </p>
      )}
    </div>
  );
}
