import { cn } from "@/lib/cn";

/**
 * Marca do Lume: anéis concêntricos abertos — o mesmo gesto da roda de
 * hábitos — em degradê do verde ao oceano.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <defs>
        <linearGradient id="lume-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a8073" />
          <stop offset="100%" stopColor="#3a6b8e" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#lume-mark)" />
      <g
        fill="none"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeOpacity="0.92"
      >
        <path d="M16 7.5a8.5 8.5 0 1 1-8.5 8.5" strokeWidth="2.1" />
        <path d="M16 12a4 4 0 1 1-4 4" strokeWidth="2.1" />
      </g>
    </svg>
  );
}

/**
 * Marca + nome, usado no cabeçalho e nas telas de conta.
 * Com `compact`, o "Life Planner" some no celular para o cabeçalho caber
 * em uma linha só.
 */
export default function Logo({
  className,
  size = "sm",
  compact = false,
}: {
  className?: string;
  size?: "sm" | "lg";
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={size === "lg" ? "h-11 w-11" : "h-8 w-8"} />
      <span
        className={cn(
          "font-semibold tracking-tight text-ink",
          size === "lg" ? "text-2xl" : "text-[0.9375rem]",
        )}
      >
        Lume
        <span
          className={cn(
            "font-normal text-muted",
            compact && "hidden sm:inline",
          )}
        >
          {" "}
          Life Planner
        </span>
      </span>
    </span>
  );
}
