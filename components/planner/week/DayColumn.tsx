"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import TaskItem from "@/components/planner/TaskItem";
import { Pin, Plus } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import type { WeekTask } from "@/app/(planner)/semana/actions";

/**
 * O alfinete: pressionado, a tarefa volta toda semana; solto, ela vive só na
 * semana aberta. Os dois estados ficam sempre visíveis — é por ele que se
 * distingue a rotina do que é exceção, então esconder no hover não serve.
 */
function PinToggle({
  pinned,
  onClick,
  label = "Fixa toda semana",
  className,
}: {
  pinned: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pinned}
      aria-label={label}
      title={pinned ? "Fixa toda semana" : "Só nesta semana"}
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors duration-200",
        pinned
          ? "text-accent hover:bg-accent-soft"
          : "text-faint hover:bg-accent-soft hover:text-accent",
        className,
      )}
    >
      <Pin className={cn("h-3.5 w-3.5", !pinned && "-rotate-45")} />
    </button>
  );
}

/** Um dia da semana: a lista daquele dia e o quanto dela saiu do papel. */
export default function DayColumn({
  name,
  date,
  isToday,
  tasks,
  isDone,
  onAdd,
  onToggle,
  onTogglePin,
  onCommit,
  onRemove,
}: {
  name: string;
  /** Data desse dia na semana aberta, 'YYYY-MM-DD'. */
  date: string;
  isToday: boolean;
  tasks: WeekTask[];
  isDone: (taskId: number) => boolean;
  onAdd: (text: string, pinned: boolean) => void;
  onToggle: (task: WeekTask) => void;
  onTogglePin: (task: WeekTask) => void;
  onCommit: (task: WeekTask, text: string) => void;
  onRemove: (task: WeekTask) => void;
}) {
  const [draft, setDraft] = useState("");
  // A escolha vale para a próxima tarefa digitada e continua onde a pessoa
  // deixou: quem está montando a rotina adiciona várias fixas em sequência.
  const [pinned, setPinned] = useState(true);

  const done = tasks.filter((t) => isDone(t.id)).length;
  const dayNumber = Number(date.slice(-2));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    onAdd(text, pinned);
  }

  return (
    <Card
      as="section"
      className={cn(
        "flex flex-col p-4 sm:min-h-[13rem] sm:p-5",
        // Hoje ganha um traço verde em vez de um fundo: o cartão continua
        // igual aos outros, só que apontado.
        isToday && "border-accent/45",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          className={cn(
            "truncate text-[0.9375rem] font-semibold tracking-tight",
            isToday ? "text-accent-ink" : "text-ink",
          )}
        >
          {name}
        </h2>
        <span
          aria-label={isToday ? `Dia ${dayNumber}, hoje` : `Dia ${dayNumber}`}
          className={cn(
            "grid h-6 min-w-6 shrink-0 place-items-center rounded-full px-1.5 text-[0.6875rem] font-medium tabular-nums",
            isToday ? "bg-accent text-accent-on" : "bg-surface-sunk text-faint",
          )}
        >
          {dayNumber}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-surface-sunk"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={tasks.length}
          aria-valuenow={done}
          aria-label={`${name}: ${done} de ${tasks.length} concluídas`}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{
              width: tasks.length ? `${(done / tasks.length) * 100}%` : "0%",
            }}
          />
        </div>
        <span className="shrink-0 text-[0.6875rem] tabular-nums text-faint">
          {done}/{tasks.length}
        </span>
      </div>

      <ul className="mt-3 flex-1 space-y-0.5">
        {tasks.length === 0 && (
          <li className="px-1 py-2 text-sm text-faint">Nada neste dia.</li>
        )}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            text={task.text}
            done={isDone(task.id)}
            onToggle={() => onToggle(task)}
            onCommit={(text) => onCommit(task, text)}
            onRemove={() => onRemove(task)}
            removeLabel={
              task.onlyWeek === null ? "Tirar da rotina" : "Remover"
            }
            action={
              <PinToggle
                pinned={task.onlyWeek === null}
                onClick={() => onTogglePin(task)}
              />
            }
          />
        ))}
      </ul>

      <form
        onSubmit={submit}
        className="no-print mt-4 flex items-center gap-1.5 rounded-xl border border-dashed border-line-strong px-2 py-1.5 transition-colors duration-200 focus-within:border-accent focus-within:bg-surface-soft sm:gap-2.5"
      >
        <button
          type="submit"
          aria-label={`Adicionar tarefa de ${name.toLowerCase()}`}
          className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-faint transition-colors duration-200 hover:bg-accent-soft hover:text-accent"
        >
          <Plus />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={pinned ? "Toda semana…" : "Só nesta semana…"}
          maxLength={300}
          className="min-w-0 flex-1 bg-transparent py-0.5 text-base outline-none placeholder:text-faint sm:text-[0.9375rem]"
        />
        <PinToggle
          pinned={pinned}
          onClick={() => setPinned((p) => !p)}
          label="Fixar a próxima tarefa em todas as semanas"
          className="h-6 w-6"
        />
      </form>
    </Card>
  );
}
