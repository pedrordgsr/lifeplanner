"use client";

import { cn } from "@/lib/cn";
import { WEEKDAY_NAMES } from "@/lib/dates";

export type WeekdayStat = { weekday: number; done: number; total: number };

/**
 * Aproveitamento de cada dia da semana no período — barras em HTML e não em
 * SVG: são sete valores, e o texto embaixo precisa acompanhar a fonte da tela.
 */
export default function WeekdayBars({ items }: { items: WeekdayStat[] }) {
  const vazio = items.every((d) => d.total === 0);

  if (vazio)
    return (
      <p className="py-10 text-center text-sm text-faint">
        Ainda não há semanas para comparar.
      </p>
    );

  return (
    <ul className="flex items-end justify-between gap-1 sm:gap-2">
      {items.map(({ weekday, done, total }) => {
        const nome = WEEKDAY_NAMES[weekday];
        const rate = total === 0 ? null : Math.round((done / total) * 100);

        return (
          <li
            key={weekday}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
            aria-label={
              rate === null
                ? `${nome}: sem tarefas`
                : `${nome}: ${done} de ${total}, ${rate}%`
            }
          >
            <span
              aria-hidden
              className={cn(
                // 100% em 11px não cabe nas colunas de um celular de 320px.
                "text-[0.625rem] font-medium tabular-nums sm:text-[0.6875rem]",
                rate === null ? "text-faint" : "text-ink-soft",
              )}
            >
              {rate === null ? "—" : `${rate}%`}
            </span>

            <span className="relative h-24 w-full max-w-9 rounded-full bg-surface-sunk sm:h-28">
              <span
                className="absolute inset-x-0 bottom-0 rounded-full bg-accent transition-[height] duration-300"
                style={{ height: `${rate ?? 0}%` }}
              />
            </span>

            <span
              aria-hidden
              className="truncate text-[0.625rem] text-muted sm:text-[0.6875rem]"
            >
              {nome.slice(0, 3).toLowerCase()}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
