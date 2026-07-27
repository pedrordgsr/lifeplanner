"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import ProfileButton from "@/components/account/ProfileButton";
import { LINKS } from "./NavLinks";

/** Alvo de toque de 44px, o mínimo confortável para o polegar. */
const ITEM = "grid h-11 w-11 place-items-center rounded-full transition-colors duration-200";

/** Verde suave para marcar: o trilho já é `bg-surface`, então clarear não bastaria. */
const ACTIVE = "bg-accent-soft text-accent-ink";

/**
 * Navegação do celular: uma pílula flutuante no rodapé, só com ícones — os
 * rótulos viram `aria-label`. Fica fora do <header> de propósito, e o
 * cabeçalho nem existe nesta largura.
 */
export default function BottomNav({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden">
      <nav className="flex items-center gap-1 rounded-full border border-line bg-surface/90 p-1.5 shadow-float backdrop-blur-xl">
        {LINKS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(ITEM, active ? ACTIVE : "text-muted")}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}

        {/* Separador: o perfil não é uma seção do planner como as outras. */}
        <span aria-hidden className="mx-0.5 h-6 w-px bg-line" />

        <ProfileButton
          username={username}
          className={cn(ITEM, "text-muted")}
          iconClassName="h-5 w-5"
        />
      </nav>
    </div>
  );
}
