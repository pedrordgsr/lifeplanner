/**
 * Constantes visuais compartilhadas entre os componentes do planner.
 *
 * Os valores em si moram em app/globals.css — aqui ficam só as referências
 * `var(...)`, para que o tema claro e o escuro troquem juntos. Como são
 * variáveis CSS e não hex, aplique-as por `style` (`style={{ fill: cor }}`)
 * e não por atributo de apresentação do SVG (`fill={cor}`).
 */

/** Rampa de 7 tons, do verde profundo ao oceano — um por hábito. */
export const HABIT_COLORS = [
  "var(--habit-1)",
  "var(--habit-2)",
  "var(--habit-3)",
  "var(--habit-4)",
  "var(--habit-5)",
  "var(--habit-6)",
  "var(--habit-7)",
] as const;

/** Versões suaves das mesmas cores, para fundos e estados de hover. */
export const HABIT_COLORS_SOFT = [
  "var(--habit-soft-1)",
  "var(--habit-soft-2)",
  "var(--habit-soft-3)",
  "var(--habit-soft-4)",
  "var(--habit-soft-5)",
  "var(--habit-soft-6)",
  "var(--habit-soft-7)",
] as const;

export const CHART_LINE = "var(--chart-line)";
export const CHART_AREA = "var(--chart-area)";
export const CHART_GRID = "var(--chart-grid)";
export const CHART_GRID_FAINT = "var(--chart-grid-faint)";
export const CHART_LABEL = "var(--chart-label)";

/** Cor do dia marcado no Mapa do Ano. */
export const YEAR_MARK = "var(--year-mark)";

/** Superfície recuada — o "vazio" das células não marcadas. */
export const SURFACE_SUNK = "var(--surface-sunk)";
export const SURFACE = "var(--surface)";
export const LINE = "var(--line)";
export const INK = "var(--ink)";
export const FAINT = "var(--faint)";
export const ACCENT = "var(--accent)";
