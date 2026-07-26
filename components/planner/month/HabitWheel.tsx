"use client";

import { ACCENT, FAINT, HABIT_COLORS, INK, SURFACE_SUNK } from "@/lib/theme";

const SIZE = 640;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 246;
const INNER_R = 104;
const RINGS = 7;
const RING_W = (OUTER_R - INNER_R) / RINGS;
const TOTAL_SWEEP = 280; // graus varridos pelo mês; o resto é a abertura
const CELL_GAP = 0.9; // respiro entre células, em graus

/**
 * Node e o navegador divergem no último dígito de Math.sin/cos, o que quebra
 * a hidratação do React. Arredondar deixa os dois lados idênticos.
 */
const round = (n: number) => Math.round(n * 1000) / 1000;

function pt(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [round(CX + r * Math.cos(rad)), round(CY + r * Math.sin(rad))];
}

function sectorPath(rOuter: number, rInner: number, a1: number, a2: number) {
  const [x1, y1] = pt(rOuter, a1);
  const [x2, y2] = pt(rOuter, a2);
  const [x3, y3] = pt(rInner, a2);
  const [x4, y4] = pt(rInner, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${x1},${y1} A${rOuter},${rOuter} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${rInner},${rInner} 0 ${large} 0 ${x4},${y4} Z`;
}

/** Anel 0 é o mais externo — o hábito 1, como na folha impressa. */
function ringRadii(ring: number) {
  const rOuter = OUTER_R - ring * RING_W - 1.6;
  return { rOuter, rInner: rOuter - RING_W + 1.6 };
}

/**
 * Retrato do mês inteiro — 7 anéis de hábitos × os dias. É só leitura:
 * quem marca é o painel de hoje ou a grade, em HabitGrid/TodayHabits.
 */
export default function HabitWheel({
  days,
  names,
  marks,
  todayDay,
  total,
}: {
  days: number;
  names: string[];
  marks: Set<string>;
  todayDay: number | null;
  total: number;
}) {
  const step = TOTAL_SWEEP / days;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto block w-full max-w-[33rem] touch-manipulation select-none"
      role="group"
      aria-label="Roda de hábitos do mês"
    >
      {Array.from({ length: RINGS }, (_, ring) => {
        const slot = ring + 1;
        const { rOuter, rInner } = ringRadii(ring);
        const color = HABIT_COLORS[ring];

        return (
          <g key={slot}>
            {Array.from({ length: days }, (_, d) => {
              const day = d + 1;
              const a1 = d * step + CELL_GAP / 2;
              const a2 = (d + 1) * step - CELL_GAP / 2;
              const key = `${slot}:${day}`;
              const on = marks.has(key);
              const habitName = names[ring]?.trim() || `Hábito ${slot}`;

              return (
                <path
                  key={day}
                  d={sectorPath(rOuter, rInner, a1, a2)}
                  style={{ fill: on ? color : SURFACE_SUNK }}
                  className="transition-[fill] duration-300"
                >
                  <title>{`${habitName} — dia ${day}${on ? " · feito" : ""}`}</title>
                </path>
              );
            })}
          </g>
        );
      })}

      {/* Números dos dias, acompanhando a curva. Escondidos no celular: a roda
          encolhe tanto que ficariam com ~5px — o detalhe fica na grade acima. */}
      <g className="hidden sm:block">
        {Array.from({ length: days }, (_, d) => {
          const day = d + 1;
          const angle = d * step + step / 2;
          const [x, y] = pt(OUTER_R + 19, angle);
          const isToday = todayDay === day;
          return (
            <text
              key={day}
              x={x}
              y={y}
              transform={`rotate(${angle} ${x} ${y})`}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={isToday ? 600 : 400}
              style={{ fill: isToday ? ACCENT : FAINT }}
            >
              {day}
            </text>
          );
        })}
      </g>

      {/* Guias numeradas na abertura da roda */}
      {Array.from({ length: RINGS }, (_, ring) => {
        const { rOuter, rInner } = ringRadii(ring);
        const yMid = CY - (rOuter + rInner) / 2;
        return (
          <g key={ring}>
            <line
              x1={CX - 86}
              y1={yMid}
              x2={CX - 10}
              y2={yMid}
              style={{ stroke: HABIT_COLORS[ring] }}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeDasharray="1 5"
              opacity={0.5}
            />
            <circle
              cx={CX - 96}
              cy={yMid}
              r={3.2}
              style={{ fill: HABIT_COLORS[ring] }}
              opacity={0.85}
            />
          </g>
        );
      })}

      {/* Centro: total de marcações */}
      {/* Centro: no celular só o número, grande e centralizado; a partir de sm
          entra a legenda embaixo. */}
      <g className="sm:hidden">
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={52}
          fontWeight={600}
          style={{ fill: INK }}
          className="tabular-nums"
        >
          {total}
        </text>
      </g>

      <g className="hidden sm:block">
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          fontSize={34}
          fontWeight={600}
          style={{ fill: INK }}
          className="tabular-nums"
        >
          {total}
        </text>
        <text
          x={CX}
          y={CY + 18}
          textAnchor="middle"
          fontSize={11}
          letterSpacing="0.09em"
          style={{ fill: FAINT }}
        >
          MARCAÇÕES
        </text>
      </g>
    </svg>
  );
}
