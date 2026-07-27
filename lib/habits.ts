/**
 * Um hábito do Mapa do Mês. Quantos hábitos o mês tem é decisão do usuário —
 * cada linha da tabela `habits` é um deles, e `slot` identifica o hábito dentro
 * do mês (também é a ordem; apagar um deixa um buraco, e tudo bem).
 */
export type HabitItem = { slot: number; name: string };

/** Teto por mês. Alto o bastante para não atrapalhar, baixo para não virar lista infinita. */
export const MAX_HABITS = 30;

/** Rótulo de fallback de um hábito ainda sem nome, pela posição na lista. */
export const habitLabel = (name: string, index: number) =>
  name.trim() || `Hábito ${index + 1}`;
