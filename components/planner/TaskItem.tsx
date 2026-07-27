"use client";

import type { ReactNode } from "react";
import Checkbox from "@/components/ui/Checkbox";
import { InlineTextarea } from "@/components/ui/Field";
import { Close } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

/**
 * Uma tarefa em uma lista: marcar, editar no lugar e remover.
 *
 * Recebe texto e estado soltos, e não um registro do banco, porque as duas
 * telas guardam "concluída" de formas diferentes — no dia é uma coluna da
 * própria tarefa; na semana é uma marcação por semana.
 */
export default function TaskItem({
  text,
  done,
  onToggle,
  onCommit,
  onRemove,
  removeLabel = "Remover",
  action,
}: {
  text: string;
  done: boolean;
  onToggle: () => void;
  onCommit: (text: string) => void;
  onRemove: () => void;
  /** Verbo do botão de remover — na semana a tarefa sai da rotina inteira. */
  removeLabel?: string;
  /** Controle extra antes do remover (a semana põe aqui o alfinete). */
  action?: ReactNode;
}) {
  return (
    <li className="group flex items-start gap-2 rounded-xl py-1 pr-0.5 sm:gap-2.5">
      <Checkbox
        checked={done}
        onChange={onToggle}
        label={`Concluir "${text}"`}
        className="mt-0.5"
      />

      <InlineTextarea
        defaultValue={text}
        maxLength={300}
        aria-label={text}
        onBlur={(e) => onCommit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            e.currentTarget.value = text;
            e.currentTarget.blur();
          }
        }}
        className={cn(done && "text-muted line-through decoration-faint")}
      />

      {action}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel} "${text}"`}
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-faint transition-colors duration-200 hover:bg-danger-soft hover:text-danger sm:text-transparent sm:group-hover:text-faint sm:focus-visible:text-faint"
      >
        <Close />
      </button>
    </li>
  );
}
