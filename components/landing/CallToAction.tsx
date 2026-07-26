import ButtonLink from "@/components/ui/ButtonLink";
import { LogoMark } from "@/components/brand/Logo";

export default function CallToAction({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface px-7 py-14 text-center shadow-card sm:px-10 sm:py-20">
        {/* Névoa verde/oceano, o mesmo gesto do fundo do app. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(38rem 20rem at 20% -20%, var(--glow-green), transparent 62%), radial-gradient(34rem 18rem at 84% 110%, var(--glow-ocean), transparent 62%)",
          }}
        />

        <div className="relative mx-auto max-w-xl">
          <LogoMark className="mx-auto h-12 w-12" />
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-[2.25rem]">
            {loggedIn
              ? "Seu mês está esperando."
              : "Comece pelo dia de hoje."}
          </h2>
          <p className="mt-4 leading-relaxed text-pretty text-ink-soft">
            {loggedIn
              ? "Continue de onde parou — a última marcação já está salva."
              : "Crie sua conta em um minuto, escolha sete hábitos e marque o primeiro quadradinho. O resto vem no seu ritmo."}
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {loggedIn ? (
              <ButtonLink href="/mes" size="lg">
                Abrir meu planner
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/registro" size="lg">
                  Criar minha conta
                </ButtonLink>
                <ButtonLink href="/login" variant="outline" size="lg">
                  Já tenho conta
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
