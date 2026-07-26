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
const H = 300;
const PAD = { top: 20, right: 20, bottom: 34, left: 44 };
const MAX = 7;

/** Hábitos cumpridos por dia ao longo do mês, de 0/7 a 7/7. */
export default function ProgressChart({
  perDay,
  days,
  todayDay,
}: {
  perDay: number[];
  days: number;
  todayDay: number | null;
}) {
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (day: number) =>
    PAD.left + ((day - 1) / Math.max(days - 1, 1)) * plotW;
  const y = (value: number) => PAD.top + plotH - (value / MAX) * plotH;

  const points = perDay.map((v, i) => [x(i + 1), y(v)] as const);
  const line = points.map(([px, py]) => `${px},${py}`).join(" ");
  const area = `${PAD.left},${y(0)} ${line} ${x(days)},${y(0)}`;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full min-w-[36rem]"
        role="img"
        aria-label={`Hábitos cumpridos por dia: ${perDay.join(", ")}`}
      >
        {/* Grade horizontal 0/7 … 7/7 */}
        {Array.from({ length: MAX + 1 }, (_, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={y(i)}
              x2={W - PAD.right}
              y2={y(i)}
              style={{ stroke: i === 0 ? CHART_GRID : CHART_GRID_FAINT }}
              strokeWidth={1}
            />
            <text
              x={PAD.left - 12}
              y={y(i)}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={10.5}
              style={{ fill: CHART_LABEL }}
            >
              {i}/7
            </text>
          </g>
        ))}

        {/* Marca sutil do dia de hoje */}
        {todayDay && (
          <line
            x1={x(todayDay)}
            y1={PAD.top}
            x2={x(todayDay)}
            y2={PAD.top + plotH}
            style={{ stroke: CHART_LINE }}
            strokeWidth={1}
            strokeDasharray="3 4"
            opacity={0.35}
          />
        )}

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
          const filled = perDay[i] > 0;
          return (
            <circle
              key={i}
              cx={px}
              cy={py}
              r={filled ? 3.5 : 2.25}
              style={{
                fill: filled ? CHART_LINE : SURFACE,
                stroke: filled ? SURFACE : CHART_GRID,
              }}
              strokeWidth={filled ? 1.5 : 1}
            >
              <title>{`Dia ${i + 1}: ${perDay[i]}/7`}</title>
            </circle>
          );
        })}

        {/* Números dos dias */}
        {perDay.map((_, i) => {
          const day = i + 1;
          const isToday = todayDay === day;
          return (
            <text
              key={day}
              x={x(day)}
              y={H - 12}
              textAnchor="middle"
              fontSize={9.5}
              fontWeight={isToday ? 600 : 400}
              style={{ fill: isToday ? CHART_LINE : CHART_LABEL }}
            >
              {day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
