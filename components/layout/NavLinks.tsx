"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { CalendarGrid, Checklist, Rings } from "@/components/ui/Icons";

export const LINKS = [
  { href: "/mes", label: "Hábitos", Icon: Rings },
  { href: "/dia", label: "Lista diária", Icon: Checklist },
  { href: "/ano", label: "Visão anual", Icon: CalendarGrid },
];

/**
 * Navegação em pílula com rótulos — o formato do cabeçalho, no desktop.
 *
 * O item marcado sobe para `bg-surface` porque o trilho é `bg-surface-soft`.
 * A pílula do rodapé (BottomNav) flutua sobre `bg-surface` e por isso marca o
 * item de outro jeito: cada barra escolhe o realce que contrasta com o seu fundo.
 */
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 rounded-full border border-line bg-surface-soft p-1">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-all duration-200",
              active
                ? "bg-surface font-medium text-accent-ink shadow-soft"
                : "text-muted hover:text-ink",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
