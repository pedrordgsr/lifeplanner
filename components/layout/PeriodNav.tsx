import type { ReactNode } from "react";
import { IconLink } from "@/components/ui/IconButton";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";

/**
 * Navegação anterior/próximo por link — usada pelo mês e pelo ano, onde o
 * período vive na URL e a página é renderizada no servidor.
 */
export default function PeriodNav({
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
  children,
  extra,
}: {
  prevHref: string;
  nextHref: string;
  prevLabel: string;
  nextLabel: string;
  /** Rótulo do período atual. */
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-2.5 sm:justify-end">
      <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface-soft p-1">
        <IconLink href={prevHref} label={prevLabel} className="h-8 w-8">
          <ChevronLeft />
        </IconLink>
        <span className="min-w-36 text-center text-[0.9375rem] font-medium tabular-nums text-ink">
          {children}
        </span>
        <IconLink href={nextHref} label={nextLabel} className="h-8 w-8">
          <ChevronRight />
        </IconLink>
      </div>
      {extra}
    </div>
  );
}
