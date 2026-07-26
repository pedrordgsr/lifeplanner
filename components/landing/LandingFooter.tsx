import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function LandingFooter({ loggedIn }: { loggedIn: boolean }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-9 sm:flex-row sm:items-center sm:px-8">
        <Logo />
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted sm:ml-auto">
          <a
            href="#paginas"
            className="transition-colors duration-200 hover:text-ink"
          >
            As três páginas
          </a>
          <a
            href="#detalhes"
            className="transition-colors duration-200 hover:text-ink"
          >
            Detalhes
          </a>
          <Link
            href={loggedIn ? "/mes" : "/login"}
            className="font-medium text-accent-ink underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:decoration-accent"
          >
            {loggedIn ? "Abrir meu planner" : "Entrar"}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
