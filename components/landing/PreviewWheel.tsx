import { FAINT, HABIT_COLORS, INK, SURFACE_SUNK } from "@/lib/theme";

/**
 * Versão reduzida e decorativa da roda de hábitos, para a landing.
 * As marcações são fixas (nada de aleatório) para o servidor e o navegador
 * desenharem exatamente o mesmo SVG.
 */

const SIZE = 320;
const C = SIZE / 2;
const OUTER_R = 138;
const INNER_R = 56;
const RINGS = 7;
const RING_W = (OUTER_R - INNER_R) / RINGS;
const DAYS = 31;
const TOTAL_SWEEP = 280;
const CELL_GAP = 1.1;

/** Quanto de cada anel aparece preenchido — dá um mês plausível, não perfeito. */
const RATES = [0.87, 0.68, 0.55, 0.9, 0.45, 0.71, 0.61];

const round = (n: number) => Math.round(n * 1000) / 1000;

function pt(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [round(C + r * Math.cos(rad)), round(C + r * Math.sin(rad))];
}

function sectorPath(rOuter: number, rInner: number, a1: number, a2: number) {
  const [x1, y1] = pt(rOuter, a1);
  const [x2, y2] = pt(rOuter, a2);
  const [x3, y3] = pt(rInner, a2);
  const [x4, y4] = pt(rInner, a1);
  return `M${x1},${y1} A${rOuter},${rOuter} 0 0 1 ${x2},${y2} L${x3},${y3} A${rInner},${rInner} 0 0 0 ${x4},${y4} Z`;
}

/** Espalhamento determinístico: mesma entrada, mesma saída, sempre. */
const filled = (ring: number, day: number) =>
  ((ring * 37 + day * 61) % 100) / 100 < RATES[ring];

/** Quantos dias cada hábito soma no mês — a legenda usa os mesmos números. */
export const PREVIEW_COUNTS = Array.from(
  { length: RINGS },
  (_, ring) =>
    Array.from({ length: DAYS }, (_, d) => filled(ring, d + 1)).filter(Boolean)
      .length,
);

export const PREVIEW_DAYS = DAYS;

const TOTAL = PREVIEW_COUNTS.reduce((a, b) => a + b, 0);

export default function PreviewWheel({ className }: { className?: string }) {
  const step = TOTAL_SWEEP / DAYS;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden>
      {Array.from({ length: RINGS }, (_, ring) => {
        const rOuter = OUTER_R - ring * RING_W - 1.4;
        const rInner = rOuter - RING_W + 1.4;

        return (
          <g key={ring}>
            {Array.from({ length: DAYS }, (_, d) => (
              <path
                key={d}
                d={sectorPath(
                  rOuter,
                  rInner,
                  d * step + CELL_GAP / 2,
                  (d + 1) * step - CELL_GAP / 2,
                )}
                style={{
                  fill: filled(ring, d + 1) ? HABIT_COLORS[ring] : SURFACE_SUNK,
                }}
              />
            ))}
          </g>
        );
      })}

      <text
        x={C}
        y={C - 4}
        textAnchor="middle"
        fontSize={30}
        fontWeight={600}
        style={{ fill: INK }}
      >
        {TOTAL}
      </text>
      <text
        x={C}
        y={C + 16}
        textAnchor="middle"
        fontSize={9}
        letterSpacing="0.09em"
        style={{ fill: FAINT }}
      >
        MARCAÇÕES
      </text>
    </svg>
  );
}
