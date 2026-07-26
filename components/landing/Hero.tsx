import ButtonLink from "@/components/ui/ButtonLink";
import PlannerPreview from "./PlannerPreview";

const REASSURANCE = [
  "Salva sozinho",
  "Funciona no celular",
  "Seus dados ficam com você",
];

export default function Hero({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-14 pb-4 sm:px-8 sm:pt-20">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        <div className="max-w-xl">
          <p className="label-eyebrow">Planner interativo</p>

          <h1 className="mt-4 text-[2.5rem] leading-[1.08] font-semibold tracking-tight text-balance text-ink sm:text-[3.25rem]">
            Um lugar calmo para cuidar dos seus dias.
          </h1>

          <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty text-ink-soft">
            O Lume junta hábitos, tarefas e metas em três telas simples — o mapa
            do mês, o planner diário e o mapa do ano. Você marca, ele guarda. Sem
            notificação, sem cobrança, sem barulho.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {loggedIn ? (
              <ButtonLink href="/mes" size="lg">
                Abrir meu planner
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" size="lg">
                  Entrar
                </ButtonLink>
                <ButtonLink href="/registro" variant="outline" size="lg">
                  Criar conta
                </ButtonLink>
              </>
            )}
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            {REASSURANCE.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent/45" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <PlannerPreview />
      </div>
    </section>
  );
}
