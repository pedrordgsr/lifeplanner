import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const BASE = cn(
  "grid h-9 w-9 place-items-center rounded-full border border-line bg-surface",
  "text-muted transition-colors duration-200",
  "hover:border-line-strong hover:bg-accent-soft hover:text-accent-ink",
);

type Common = { children: ReactNode; label: string; className?: string };

/** Botão circular de ação secundária (setas de navegação, por exemplo). */
export function IconButton({
  children,
  label,
  className,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(BASE, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Mesma aparência, mas navegando por link (mantém o histórico e o SSR). */
export function IconLink({
  children,
  label,
  href,
  className,
}: Common & { href: string }) {
  return (
    <Link href={href} aria-label={label} className={cn(BASE, className)}>
      {children}
    </Link>
  );
}
