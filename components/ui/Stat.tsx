import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StatItem = { label: string; value: ReactNode; hint?: string };

/**
 * Um número em destaque com seu rótulo. `mt-auto` no valor mantém todos os
 * números na mesma linha mesmo quando um rótulo quebra em duas (telas estreitas).
 */
export function Stat({ label, value, hint }: StatItem) {
  return (
    <div className="flex h-full flex-col">
      <dt className="label-eyebrow">{label}</dt>
      <dd className="mt-auto pt-1 text-xl font-semibold tabular-nums text-ink sm:text-2xl">
        {value}
      </dd>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/** Linha de estatísticas separada do conteúdo por um traço fino. */
export function StatRow({
  items,
  className,
  divided = true,
}: {
  items: StatItem[];
  className?: string;
  divided?: boolean;
}) {
  return (
    <dl
      className={cn(
        "grid gap-5",
        items.length >= 3 ? "grid-cols-3" : "grid-cols-2",
        divided && "border-t border-line pt-5",
        className,
      )}
    >
      {items.map((item) => (
        <Stat key={item.label} {...item} />
      ))}
    </dl>
  );
}
