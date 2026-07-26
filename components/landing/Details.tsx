import Card from "@/components/ui/Card";

const EXTRAS = [
  {
    title: "Salva enquanto você escreve",
    text: "Notas e metas gravam sozinhas, com um aviso discreto de “salvo”. Nada de botão para lembrar de apertar.",
  },
  {
    title: "Copiar do mês anterior",
    text: "Comece o mês novo com os mesmos sete hábitos do anterior, em um clique.",
  },
  {
    title: "Mover para amanhã",
    text: "As tarefas que não deram tempo hoje viram a lista de amanhã sem retrabalho.",
  },
  {
    title: "Números que aparecem sozinhos",
    text: "Contador por hábito, aproveitamento do mês, melhor dia, média e sequência atual.",
  },
  {
    title: "Cabe no celular",
    text: "No telefone a navegação fica ao alcance do polegar e os alvos de toque são generosos — dá para marcar o dia na fila do café.",
  },
  {
    title: "Bonito impresso",
    text: "Quer o mês na parede ou na agenda? Mande imprimir: os botões de navegação somem e sobra só o planner.",
  },
];

export default function Details() {
  return (
    <section
      id="detalhes"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 pb-20 sm:px-8 sm:pb-24"
    >
      <div className="max-w-2xl">
        <p className="label-eyebrow">Detalhes</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-[2.125rem]">
          Os cuidados que tiram o trabalho da sua frente.
        </h2>
        <p className="mt-4 leading-relaxed text-pretty text-ink-soft">
          Nada aqui pede sua atenção duas vezes: o planner faz a parte chata e
          deixa você com a parte de decidir.
        </p>
      </div>

      <ul className="mt-11 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {EXTRAS.map((extra) => (
          <li key={extra.title}>
            <div className="h-px w-10 bg-accent/35" />
            <h3 className="mt-4 font-semibold tracking-tight text-ink">
              {extra.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {extra.text}
            </p>
          </li>
        ))}
      </ul>

      <Card
        tone="soft"
        className="mt-14 flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:gap-10 sm:p-9"
      >
        <div className="sm:max-w-sm">
          <p className="label-eyebrow">Sua conta</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Rápida de abrir, só sua.
          </h3>
        </div>
        <ul className="grid flex-1 gap-3 text-sm text-ink-soft sm:grid-cols-2">
          {[
            "Um usuário e uma senha. Sem e-mail, sem cadastro longo.",
            "Sua senha fica guardada de um jeito que ninguém consegue ler — nem quem cuida do planner.",
            "Você segue conectado por 30 dias e sai quando quiser.",
            "O que você escreve é só seu: ninguém mais alcança as suas páginas.",
          ].map((item) => (
            <li key={item} className="flex gap-2.5 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/50" />
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
