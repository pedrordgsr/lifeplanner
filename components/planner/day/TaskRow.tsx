"use client";

import Checkbox from "@/components/ui/Checkbox";
import { InlineTextarea } from "@/components/ui/Field";
import { Close } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import type { Task } from "@/app/(planner)/dia/actions";

/** Uma tarefa: marcar, editar no lugar e remover. */
export default function TaskRow({
  task,
  onToggle,
  onCommit,
  onRemove,
}: {
  task: Task;
  onToggle: () => void;
  onCommit: (text: string) => void;
  onRemove: () => void;
}) {
  const done = task.done === 1;

  return (
    <li className="group flex items-start gap-2.5 rounded-xl py-1 pr-0.5">
      <Checkbox
        checked={done}
        onChange={onToggle}
        label={`Concluir "${task.text}"`}
        className="mt-0.5"
      />

      <InlineTextarea
        defaultValue={task.text}
        maxLength={300}
        aria-label={task.text}
        onBlur={(e) => onCommit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            e.currentTarget.value = task.text;
            e.currentTarget.blur();
          }
        }}
        className={cn(done && "text-muted line-through decoration-faint")}
      />

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover "${task.text}"`}
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-faint transition-colors duration-200 hover:bg-danger-soft hover:text-danger sm:text-transparent sm:group-hover:text-faint sm:focus-visible:text-faint"
      >
        <Close />
      </button>
    </li>
  );
}
