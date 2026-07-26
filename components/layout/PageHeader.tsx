import type { ReactNode } from "react";

/** Título da página com subtítulo e um espaço à direita para os controles. */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        {eyebrow && <p className="label-eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">
            {subtitle}
          </p>
        )}
      </div>
      {/* `min-w-0` deixa os controles quebrarem em telas estreitas em vez de vazar. */}
      {actions && <div className="no-print min-w-0">{actions}</div>}
    </header>
  );
}
