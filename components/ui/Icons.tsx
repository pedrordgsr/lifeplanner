import type { SVGProps } from "react";

/** Traço fino e pontas arredondadas — o vocabulário de ícones do Lume. */
function Stroke(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

export function ChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-4 w-4" {...props}>
      <path d="M12.5 4.5 7 10l5.5 5.5" />
    </Stroke>
  );
}

export function ChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-4 w-4" {...props}>
      <path d="M7.5 4.5 13 10l-5.5 5.5" />
    </Stroke>
  );
}

export function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-3 w-3" strokeWidth={2.4} {...props}>
      <path d="M4 10.5 8 14.5 16 5.5" />
    </Stroke>
  );
}

export function Plus(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-3.5 w-3.5" {...props}>
      <path d="M10 4.5v11M4.5 10h11" />
    </Stroke>
  );
}

export function Close(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-3.5 w-3.5" {...props}>
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
    </Stroke>
  );
}

export function Exit(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-4 w-4" {...props}>
      <path d="M12.5 6V4.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V14" />
      <path d="M8.5 10h8m0 0-2.5-2.5M16.5 10 14 12.5" />
    </Stroke>
  );
}

export function Download(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-4 w-4" {...props}>
      <path d="M10 3.5v9m0 0 3.25-3.25M10 12.5 6.75 9.25" />
      <path d="M4 14.5v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
    </Stroke>
  );
}

export function Sun(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-4 w-4" {...props}>
      <circle cx="10" cy="10" r="3.6" />
      <path d="M10 2.6v1.6M10 15.8v1.6M17.4 10h-1.6M4.2 10H2.6M15.23 4.77l-1.13 1.13M5.9 14.1l-1.13 1.13M15.23 15.23l-1.13-1.13M5.9 5.9 4.77 4.77" />
    </Stroke>
  );
}

export function Moon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-4 w-4" {...props}>
      <path d="M16.2 11.6A6.6 6.6 0 0 1 8.4 3.8a6.6 6.6 0 1 0 7.8 7.8Z" />
    </Stroke>
  );
}

/* --- Ícones da navegação: um por seção do planner. --- */

/** Mapa do Mês — os anéis da roda de hábitos. */
export function Rings(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-5 w-5" {...props}>
      <circle cx="10" cy="10" r="6.6" />
      <circle cx="10" cy="10" r="3" />
    </Stroke>
  );
}

/** Planner Diário — a lista de tarefas marcáveis. */
export function Checklist(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-5 w-5" {...props}>
      <path d="M3.4 6.3 4.6 7.5 6.9 5.2" />
      <path d="M3.4 12.6 4.6 13.8 6.9 11.5" />
      <path d="M9.6 6.4h7M9.6 12.7h7" />
    </Stroke>
  );
}

/** Mapa do Ano — a grade de doze meses. */
export function CalendarGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-5 w-5" {...props}>
      <rect x="3" y="4.4" width="14" height="12.4" rx="2.2" />
      <path d="M3 8.4h14" />
      <path d="M6.9 2.9v2.8M13.1 2.9v2.8" />
    </Stroke>
  );
}

export function User(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-5 w-5" {...props}>
      <circle cx="10" cy="7.1" r="3.1" />
      <path d="M4.3 16.6c0-2.9 2.6-4.5 5.7-4.5s5.7 1.6 5.7 4.5" />
    </Stroke>
  );
}

export function Pencil(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-4 w-4" {...props}>
      <path d="M13.4 3.8a1.75 1.75 0 0 1 2.5 2.5l-8.4 8.4-3.3 1 1-3.3 8.2-8.6Z" />
    </Stroke>
  );
}

export function Key(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke className="h-4 w-4" {...props}>
      <circle cx="7" cy="10" r="3.3" />
      <path d="M10.3 10h6.4m-1.7 0v2.3m-2.4-2.3v2.3" />
    </Stroke>
  );
}
