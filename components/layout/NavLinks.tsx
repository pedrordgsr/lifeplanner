"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/mes", label: "Hábitos" },
  { href: "/dia", label: "Lista diária" },
  { href: "/ano", label: "Visão anual" },
];

/**
 * Navegação em pílula. No celular ocupa a largura toda e divide o espaço
 * igualmente entre os três — alvos grandes e sem sobra à direita.
 */
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full items-center gap-0.5 rounded-full border border-line bg-surface-soft p-1 sm:w-auto">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 rounded-full px-2 py-2 text-center text-[13px] transition-all duration-200 sm:flex-none sm:px-4 sm:py-1.5 sm:text-sm",
              active
                ? "bg-surface font-medium text-accent-ink shadow-soft"
                : "text-muted hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
