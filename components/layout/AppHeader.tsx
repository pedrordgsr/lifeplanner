import Link from "next/link";
import Logo from "@/components/brand/Logo";
import NavLinks from "./NavLinks";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import ProfileButton from "@/components/account/ProfileButton";

/**
 * Barra fixa do topo — só no desktop. No celular ela não existe: a navegação
 * virou a pílula do rodapé (BottomNav) e a conta, a folha de perfil que ela
 * abre, tudo ao alcance do polegar.
 */
export default function AppHeader({ username }: { username: string }) {
  return (
    <header className="no-print sticky top-0 z-30 hidden border-b border-line/80 bg-bg/80 backdrop-blur-xl sm:block">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-8 py-3.5">
        <Link href="/mes" className="shrink-0">
          <Logo compact />
        </Link>

        <NavLinks />

        <div className="ml-auto flex items-center gap-2.5">
          <span className="text-sm text-muted">@{username}</span>
          <InstallAppButton />
          <ProfileButton
            username={username}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted transition-colors duration-200 hover:border-line-strong hover:bg-accent-soft hover:text-accent-ink"
            iconClassName="h-4 w-4"
          />
        </div>
      </div>
    </header>
  );
}
