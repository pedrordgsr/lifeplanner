"use client";

import {
  CHART_AREA,
  CHART_GRID,
  CHART_GRID_FAINT,
  CHART_LABEL,
  CHART_LINE,
  SURFACE,
} from "@/lib/theme";

const W = 920;
const H = 270;
const PAD = { top: 20, right: 20, bottom: 40, left: 58 };
/** Linhas de grade em 0, 25, 50, 75 e 100%. */
const STEPS = 4;
/**
 * Tamanho da fonte em unidades do viewBox, e não em px: o SVG é escalado para a
 * largura disponível, então 9.5 aqui viraria ~5px no celular. Com 14 e a largura
 * mínima abaixo, o rótulo nunca desce de ~9px reais.
 */
const LABEL = 14;
const MIN_W = "34rem";

export type WeekPoint = { week: string; done: number; total: number };

/** 'YYYY-MM-DD' -> '12/01' */
const shortDate = (week: string) => `${week.slice(8)}/${week.slice(5, 7)}`;

/** Quanto da rotina saiu do papel em cada uma das últimas semanas. */
export default function WeekProgressChart({
  history,
}: {
  history: WeekPoint[];
}) {
  // Semanas anteriores à primeira tarefa não são zero por cima: elas não
  // existiam. A linha começa onde a rotina começou.
  const first = history.findIndex((h) => h.total > 0);

  if (first === -1)
    return (
      <p className="py-10 text-center text-sm text-faint">
        Crie as tarefas dos seus dias e o gráfico começa a se desenhar aqui.
      </p>
    );

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (i: number) =>
    PAD.left + (i / Math.max(history.length - 1, 1)) * plotW;
  const y = (value: number) => PAD.top + plotH - (value / 100) * plotH;

  const rate = (p: WeekPoint) => (p.total ? (p.done / p.total) * 100 : 0);

  const points = history
    .slice(first)
    .map((p, i) => [x(first + i), y(rate(p))] as const);
  const line = points.map(([px, py]) => `${px},${py}`).join(" ");
  const area = `${x(first)},${y(0)} ${line} ${x(history.length - 1)},${y(0)}`;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: MIN_W }}
        className="block h-auto w-full"
        role="img"
        aria-label={`Aproveitamento por semana: ${history
          .slice(first)
          .map((p) => `${shortDate(p.week)} ${Math.round(rate(p))}%`)
          .join(", ")}`}
      >
        {Array.from({ length: STEPS + 1 }, (_, i) => {
          const value = (i / STEPS) * 100;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={y(value)}
                x2={W - PAD.right}
                y2={y(value)}
                style={{ stroke: i === 0 ? CHART_GRID : CHART_GRID_FAINT }}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 14}
                y={y(value)}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={LABEL}
                style={{ fill: CHART_LABEL }}
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Marca da semana aberta, sempre a última do histórico. */}
        <line
          x1={x(history.length - 1)}
          y1={PAD.top}
          x2={x(history.length - 1)}
          y2={PAD.top + plotH}
          style={{ stroke: CHART_LINE }}
          strokeWidth={1}
          strokeDasharray="3 4"
          opacity={0.35}
        />

        <polygon points={area} style={{ fill: CHART_AREA }} />
        <polyline
          points={line}
          fill="none"
          style={{ stroke: CHART_LINE }}
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map(([px, py], i) => {
          const p = history[first + i];
          const filled = p.done > 0;
          return (
            <circle
              key={p.week}
              cx={px}
              cy={py}
              r={filled ? 3.5 : 2.25}
              style={{
                fill: filled ? CHART_LINE : SURFACE,
                stroke: filled ? SURFACE : CHART_GRID,
              }}
              strokeWidth={filled ? 1.5 : 1}
            >
              <title>{`Semana de ${shortDate(p.week)}: ${p.done}/${p.total} (${Math.round(rate(p))}%)`}</title>
            </circle>
          );
        })}

        {history.map((p, i) => {
          const isLast = i === history.length - 1;
          return (
            <text
              key={p.week}
              x={x(i)}
              y={H - 14}
              textAnchor="middle"
              fontSize={LABEL}
              fontWeight={isLast ? 600 : 400}
              style={{ fill: isLast ? CHART_LINE : CHART_LABEL }}
            >
              {shortDate(p.week)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
