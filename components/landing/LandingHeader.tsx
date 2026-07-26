import Link from "next/link";
import Logo from "@/components/brand/Logo";
import ButtonLink from "@/components/ui/ButtonLink";
import ThemeToggle from "@/components/theme/ThemeToggle";

const SECTIONS = [
  { href: "#paginas", label: "As três páginas" },
  { href: "#detalhes", label: "Detalhes" },
];

/** Topo da landing: marca à esquerda, entrada da conta à direita. */
export default function LandingHeader({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-5 py-3.5 sm:px-8">
        <Link href="/" className="shrink-0">
          <Logo compact />
        </Link>

        <nav className="ml-auto hidden items-center gap-7 md:flex">
          {SECTIONS.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="text-sm text-muted transition-colors duration-200 hover:text-ink"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle className="h-8 w-8" />
          {loggedIn ? (
            <ButtonLink href="/mes" size="sm">
              Abrir meu planner
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/registro" variant="ghost" size="sm">
                Criar conta
              </ButtonLink>
              <ButtonLink href="/login" size="sm">
                Entrar
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
