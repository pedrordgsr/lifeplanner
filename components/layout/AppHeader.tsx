import Link from "next/link";
import Logo from "@/components/brand/Logo";
import NavLinks from "./NavLinks";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Exit } from "@/components/ui/Icons";
import { logoutAction } from "@/app/(auth)/actions";

/** Barra fixa do topo: marca, navegação e a conta em uso. */
export default function AppHeader({ username }: { username: string }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line/80 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2.5 px-4 py-3 sm:gap-y-3 sm:px-8 sm:py-3.5">
        <Link href="/mes" className="shrink-0">
          {/* No celular só a marca curta cabe ao lado do botão de sair. */}
          <Logo compact />
        </Link>

        {/* No celular a navegação vira barra fixa no rodapé (BottomNav). */}
        <div className="hidden sm:block">
          <NavLinks />
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <span className="hidden text-sm text-muted sm:inline">
            @{username}
          </span>
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sair da conta"
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted transition-colors duration-200 hover:border-line-strong hover:bg-accent-soft hover:text-accent-ink"
            >
              <Exit />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
