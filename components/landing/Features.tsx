import type { ReactNode } from "react";
import Card from "@/components/ui/Card";
import Face from "@/components/planner/day/Face";
import { ACCENT, LINE, HABIT_COLORS, SURFACE_SUNK } from "@/lib/theme";

/** Marcações fixas das ilustrações — nada de aleatório, para não brigar com a hidratação. */
const on = (a: number, b: number, rate: number) =>
  ((a * 29 + b * 53) % 100) / 100 < rate;

function MonthArt() {
  return (
    <svg viewBox="0 0 200 96" className="w-full" aria-hidden>
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 14 }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 14 + 3}
            y={row * 15 + 5}
            width={10}
            height={10}
            rx={3}
            style={{
              fill: on(row, col, 0.62) ? HABIT_COLORS[row] : SURFACE_SUNK,
            }}
          />
        )),
      )}
    </svg>
  );
}

function DayArt() {
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {[true, true, false].map((done, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span
              className={
                done
                  ? "h-3.5 w-3.5 rounded-md bg-accent"
                  : "h-3.5 w-3.5 rounded-md border border-line-strong"
              }
            />
            <span
              className="h-2 rounded-full bg-line"
              style={{ width: `${[68, 52, 78][i]}%` }}
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 pt-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <span
            key={level}
            className={
              level === 4
                ? "h-8 w-8 text-accent"
                : "h-8 w-8 text-faint"
            }
          >
            <Face level={level} />
          </span>
        ))}
      </div>
    </div>
  );
}

function WeekArt() {
  return (
    <svg viewBox="0 0 200 96" className="w-full" aria-hidden>
      {Array.from({ length: 7 }, (_, col) => (
        <g key={col}>
          <rect
            x={col * 28 + 5}
            y={8}
            width={11}
            height={4}
            rx={2}
            style={{ fill: LINE }}
          />
          {Array.from({ length: 4 }, (_, row) => (
            <rect
              key={row}
              x={col * 28 + 5}
              y={row * 17 + 22}
              width={18}
              height={9}
              rx={3}
              style={{ fill: on(row + 2, col, 0.58) ? ACCENT : LINE }}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

const FEATURES: Array<{
  eyebrow: string;
  title: string;
  text: string;
  art: ReactNode;
}> = [
  {
    eyebrow: "Mapa do mês",
    title: "Seus hábitos, o mês inteiro em uma roda",
    text: "Marque tocando na pastilha de hoje ou preencha a grade do mês inteiro. A roda e o gráfico de progresso acompanham sozinhos.",
    art: <MonthArt />,
  },
  {
    eyebrow: "Planner diário",
    title: "Tarefas, notas e como o dia foi",
    text: "Inegociáveis, lista de tarefas, um espaço para escrever e as cinco carinhas da avaliação. O que sobrou vai para amanhã com um toque.",
    art: <DayArt />,
  },
  {
    eyebrow: "Planejamento semanal",
    title: "A rotina que se repete toda semana",
    text: "Monte a lista de cada dia da semana uma vez: ela volta igual na semana seguinte. Os gráficos mostram como você tem se saído e em que dia a rotina costuma escorregar.",
    art: <WeekArt />,
  },
];

export default function Features() {
  return (
    <section
      id="paginas"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24"
    >
      <div className="max-w-2xl">
        <p className="label-eyebrow">As três páginas</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-[2.125rem]">
          Um lugar para hoje, um para a semana, um para o mês.
        </h2>
        <p className="mt-4 leading-relaxed text-pretty text-ink-soft">
          Cada página cuida de um horizonte — o dia, a semana, o mês — e as setas
          do cabeçalho levam para frente e para trás em qualquer um deles.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="flex flex-col p-6">
            <div className="grid min-h-[8rem] place-items-center rounded-[1.25rem] bg-surface-sunk px-4 py-5">
              {feature.art}
            </div>
            <p className="label-eyebrow mt-6">{feature.eyebrow}</p>
            <h3 className="mt-2 text-lg leading-snug font-semibold tracking-tight text-ink">
              {feature.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              {feature.text}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
