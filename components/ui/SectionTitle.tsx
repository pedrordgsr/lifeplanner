import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Cabeçalho interno de um bloco: título à esquerda, apoio à direita. */
export default function SectionTitle({
  title,
  aside,
  subtitle,
  className,
}: {
  title: ReactNode;
  aside?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1",
        className,
      )}
    >
      <div>
        <h2 className="text-[1.0625rem] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {aside && <div className="text-xs text-muted">{aside}</div>}
    </div>
  );
}
