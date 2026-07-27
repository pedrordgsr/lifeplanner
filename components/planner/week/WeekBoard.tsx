"use client";

import { useRef, useState, useTransition } from "react";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { StatRow } from "@/components/ui/Stat";
import DayColumn from "./DayColumn";
import WeekProgressChart from "./WeekProgressChart";
import WeekdayBars from "./WeekdayBars";
import {
  addWeekTask,
  deleteWeekTask,
  setWeekTaskDone,
  setWeekTaskPinned,
  updateWeekTaskText,
  type WeekTask,
} from "@/app/(planner)/semana/actions";
import {
  WEEKDAY_NAMES,
  WEEK_ORDER,
  shiftDate,
  shiftWeek,
  todayKey,
  weekDates,
  weekStartOf,
} from "@/lib/dates";

/** Quantas semanas o histórico olha para trás. */
export const HISTORY_WEEKS = 12;

const markKey = (taskId: number, week: string) => `${taskId}:${week}`;

const pct = (done: number, total: number) =>
  total === 0 ? null : Math.round((done / total) * 100);

export default function WeekBoard({
  weekStart,
  initialTasks,
  initialMarks,
}: {
  weekStart: string;
  initialTasks: WeekTask[];
  /** Marcações da janela carregada, como `taskId:semana`. */
  initialMarks: string[];
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [marks, setMarks] = useState(() => new Set(initialMarks));
  const [, startTransition] = useTransition();

  /** Tarefas marcadas antes de o id definitivo chegar do servidor. */
  const marcadasSemId = useRef(new Set<number>());

  const today = todayKey();
  const currentWeek = weekStartOf(today);
  const dates = weekDates(weekStart);

  const isDone = (taskId: number) => marks.has(markKey(taskId, weekStart));

  /** Liga ou desliga uma marca no conjunto local. */
  function setMark(key: string, on: boolean) {
    setMarks((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function add(weekday: number, text: string, pinned: boolean) {
    // Item provisório com id negativo até o servidor devolver o id real.
    const tempId = -Date.now();
    setTasks((prev) => [
      ...prev,
      {
        id: tempId,
        weekday,
        text,
        position: 1e9,
        createdWeek: weekStart,
        onlyWeek: pinned ? null : weekStart,
      },
    ]);

    startTransition(async () => {
      try {
        const saved = await addWeekTask(weekStart, weekday, text, pinned);
        setTasks((prev) => prev.map((t) => (t.id === tempId ? saved : t)));

        // Marcar antes do id chegar é raro (são milissegundos), mas se
        // aconteceu a marca troca de id e só agora pode ir ao banco.
        setMarks((prev) => {
          const temp = markKey(tempId, weekStart);
          if (!prev.has(temp)) return prev;
          const next = new Set(prev);
          next.delete(temp);
          next.add(markKey(saved.id, weekStart));
          return next;
        });
        if (marcadasSemId.current.delete(tempId))
          await setWeekTaskDone(saved.id, weekStart, true);
      } catch {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      }
    });
  }

  function toggle(task: WeekTask) {
    const key = markKey(task.id, weekStart);
    const willMark = !marks.has(key);
    setMark(key, willMark);

    if (task.id < 0) {
      // Sem id ainda: guarda a intenção para o `add` gravar quando ele chegar.
      if (willMark) marcadasSemId.current.add(task.id);
      else marcadasSemId.current.delete(task.id);
      return;
    }

    startTransition(async () => {
      try {
        await setWeekTaskDone(task.id, weekStart, willMark);
      } catch {
        setMark(key, !willMark);
      }
    });
  }

  /** Prende a tarefa em todas as semanas, ou a solta só nesta. */
  function togglePin(task: WeekTask) {
    const willPin = task.onlyWeek !== null;
    const antes = { createdWeek: task.createdWeek, onlyWeek: task.onlyWeek };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              onlyWeek: willPin ? null : weekStart,
              // Fixar recomeça a rotina aqui; o servidor confirma em seguida.
              createdWeek: willPin
                ? weekStart < currentWeek
                  ? weekStart
                  : currentWeek
                : t.createdWeek,
            }
          : t,
      ),
    );
    if (task.id < 0) return;

    startTransition(async () => {
      try {
        const salvo = await setWeekTaskPinned(task.id, weekStart, willPin);
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, ...salvo } : t)),
        );
      } catch {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, ...antes } : t)),
        );
      }
    });
  }

  function commitText(task: WeekTask, text: string) {
    const clean = text.trim();
    if (clean === task.text) return;
    if (!clean) return remove(task);

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, text: clean } : t)),
    );
    if (task.id < 0) return;
    startTransition(async () => {
      await updateWeekTaskText(task.id, clean);
    });
  }

  function remove(task: WeekTask) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    // O histórico da tarefa vai junto, como no banco (ON DELETE CASCADE).
    setMarks(
      (prev) =>
        new Set(Array.from(prev).filter((k) => !k.startsWith(`${task.id}:`))),
    );
    if (task.id < 0) return;
    startTransition(async () => {
      await deleteWeekTask(task.id);
    });
  }

  /* --- números ------------------------------------------------------- */

  /**
   * A tarefa faz parte daquela semana? A fixa entra em toda semana a partir do
   * começo da rotina; a solta, só na semana dela. É o que impede uma tarefa de
   * hoje de contar como falhada num passado em que ela não existia.
   */
  const belongs = (task: WeekTask, week: string) =>
    task.onlyWeek === null
      ? task.createdWeek <= week
      : task.onlyWeek === week;

  const thisWeek = tasks.filter((t) => belongs(t, weekStart));
  const doneThisWeek = thisWeek.filter((t) => isDone(t.id)).length;

  // O histórico termina na semana aberta, e nunca depois de hoje.
  const historyEnd = weekStart < currentWeek ? weekStart : currentWeek;
  const history = Array.from({ length: HISTORY_WEEKS }, (_, i) => {
    const week = shiftWeek(historyEnd, i - (HISTORY_WEEKS - 1));
    const daSemana = tasks.filter((t) => belongs(t, week));
    return {
      week,
      done: daSemana.filter((t) => marks.has(markKey(t.id, week))).length,
      total: daSemana.length,
    };
  });

  const byWeekday = WEEK_ORDER.map((weekday, index) => {
    const doDia = tasks.filter((t) => t.weekday === weekday);
    let done = 0;
    let total = 0;
    for (const { week } of history) {
      // O dia só entra na conta depois de acontecer — senão a sexta-feira desta
      // semana já contaria como falhada na segunda.
      if (shiftDate(week, index) > today) continue;
      for (const task of doDia) {
        if (!belongs(task, week)) continue;
        total += 1;
        if (marks.has(markKey(task.id, week))) done += 1;
      }
    }
    return { weekday, done, total };
  });

  // Média só das semanas já fechadas: a atual ainda está acontecendo e puxaria
  // o número para baixo toda segunda-feira.
  const fechadas = history.filter((h) => h.week < currentWeek && h.total > 0);
  const media =
    fechadas.length === 0
      ? null
      : Math.round(
          (fechadas.reduce((soma, h) => soma + h.done / h.total, 0) /
            fechadas.length) *
            100,
        );

  const aproveitamento = pct(doneThisWeek, thisWeek.length);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {WEEK_ORDER.map((weekday, index) => (
          <DayColumn
            key={weekday}
            name={WEEKDAY_NAMES[weekday]}
            date={dates[index]}
            isToday={dates[index] === today}
            tasks={thisWeek.filter((t) => t.weekday === weekday)}
            isDone={isDone}
            onAdd={(text, pinned) => add(weekday, text, pinned)}
            onToggle={toggle}
            onTogglePin={togglePin}
            onCommit={commitText}
            onRemove={remove}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card as="section" className="min-w-0 p-5 sm:p-7">
          <SectionTitle
            title="Como você tem se saído"
            subtitle={`Tarefas concluídas em cada uma das últimas ${HISTORY_WEEKS} semanas.`}
          />

          <StatRow
            className="mt-5"
            items={[
              {
                label: "Nesta semana",
                value: `${doneThisWeek}/${thisWeek.length}`,
              },
              {
                label: "Aproveitamento",
                value: aproveitamento === null ? "—" : `${aproveitamento}%`,
              },
              {
                label: "Média",
                value: media === null ? "—" : `${media}%`,
                hint: "semanas fechadas",
              },
            ]}
          />

          <div className="mt-6">
            <WeekProgressChart history={history} />
          </div>
        </Card>

        <Card as="section" className="min-w-0 p-5 sm:p-7">
          <SectionTitle
            title="Por dia da semana"
            subtitle="Onde a rotina se sustenta e onde ela escorrega."
          />
          <div className="mt-6">
            <WeekdayBars items={byWeekday} />
          </div>
        </Card>
      </div>
    </div>
  );
}
