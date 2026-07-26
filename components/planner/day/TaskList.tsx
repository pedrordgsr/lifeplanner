"use client";

import { useState, useTransition } from "react";
import TaskRow from "./TaskRow";
import { Plus } from "@/components/ui/Icons";
import {
  addTask,
  deleteTask,
  setTaskDone,
  updateTaskText,
  type Task,
  type TaskKind,
} from "@/app/(planner)/dia/actions";

/** Lista de tarefas de um tipo, com edição otimista e campo de entrada. */
export default function TaskList({
  date,
  kind,
  tasks,
  setTasks,
  placeholder,
  emptyHint,
}: {
  date: string;
  kind: TaskKind;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  placeholder: string;
  emptyHint: string;
}) {
  const [draft, setDraft] = useState("");
  const [, startTransition] = useTransition();

  const mine = tasks.filter((t) => t.kind === kind);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");

    // Item provisório com id negativo até o servidor devolver o id real.
    const tempId = -Date.now();
    setTasks((prev) => [
      ...prev,
      { id: tempId, text, done: 0, kind, position: 1e9 },
    ]);

    startTransition(async () => {
      try {
        const saved = await addTask(date, kind, text);
        setTasks((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
      } catch {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      }
    });
  }

  function toggle(task: Task) {
    const done = task.done ? 0 : 1;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done } : t)));
    if (task.id < 0) return;
    startTransition(async () => {
      await setTaskDone(task.id, done === 1);
    });
  }

  function commitText(task: Task, text: string) {
    const clean = text.trim();
    if (clean === task.text) return;
    if (!clean) return remove(task);
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, text: clean } : t)),
    );
    if (task.id < 0) return;
    startTransition(async () => {
      await updateTaskText(task.id, clean);
    });
  }

  function remove(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    if (task.id < 0) return;
    startTransition(async () => {
      await deleteTask(task.id);
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="flex-1 space-y-0.5">
        {mine.length === 0 && (
          <li className="px-1 py-2 text-sm text-faint">{emptyHint}</li>
        )}
        {mine.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => toggle(task)}
            onCommit={(text) => commitText(task, text)}
            onRemove={() => remove(task)}
          />
        ))}
      </ul>

      <form
        onSubmit={submit}
        className="no-print mt-4 flex items-center gap-2.5 rounded-xl border border-dashed border-line-strong px-2 py-1.5 transition-colors duration-200 focus-within:border-accent focus-within:bg-surface-soft"
      >
        <button
          type="submit"
          aria-label="Adicionar tarefa"
          className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-faint transition-colors duration-200 hover:bg-accent-soft hover:text-accent"
        >
          <Plus />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          maxLength={300}
          className="min-w-0 flex-1 bg-transparent py-0.5 text-[0.9375rem] outline-none placeholder:text-faint"
        />
      </form>
    </div>
  );
}
