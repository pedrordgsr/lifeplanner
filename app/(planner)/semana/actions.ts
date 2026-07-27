"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { todayKey, weekStartOf } from "@/lib/dates";

export type WeekTask = {
  id: number;
  weekday: number;
  text: string;
  position: number;
  /** Segunda-feira em que a tarefa entrou na rotina. */
  createdWeek: string;
  /** `null` = fixa, aparece toda semana. Preenchida = só naquela semana. */
  onlyWeek: string | null;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Aceita só a data de uma segunda-feira — a chave da semana. */
function assertWeek(weekStart: string) {
  if (!DATE_RE.test(weekStart) || weekStartOf(weekStart) !== weekStart)
    throw new Error("Semana inválida");
  return weekStart;
}

function assertWeekday(weekday: number) {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6)
    throw new Error("Dia da semana inválido");
  return weekday;
}

/**
 * Como no planner diário, as escritas filtram por `userId` dentro do próprio
 * comando em vez de conferir o dono numa consulta à parte — a permissão vira
 * parte do UPDATE/DELETE, sem brecha entre checar e alterar.
 */
function assertAlterou(contagem: number) {
  if (contagem === 0) throw new Error("Tarefa não encontrada");
}

/**
 * De qual semana a rotina passa a valer. É a semana aberta — mas olhando para o
 * futuro vale desde já: a tarefa já aparece na lista de hoje, então precisa
 * entrar também na conta de hoje.
 */
function inicioDaRotina(weekStart: string) {
  const semanaAtual = weekStartOf(todayKey());
  return weekStart < semanaAtual ? weekStart : semanaAtual;
}

export async function addWeekTask(
  weekStart: string,
  weekday: number,
  text: string,
  /** Fixa (toda semana) ou solta (só na semana aberta). */
  pinned: boolean,
): Promise<WeekTask> {
  const { uid } = await requireUser();
  assertWeek(weekStart);
  const wd = assertWeekday(weekday);
  const clean = text.trim().slice(0, 300);
  if (!clean) throw new Error("Tarefa vazia");

  const createdWeek = inicioDaRotina(weekStart);
  const onlyWeek = pinned ? null : weekStart;

  // SQL cru de propósito: a posição sai de uma subconsulta dentro do próprio
  // INSERT, então não há janela entre ler o MAX e gravar (o mesmo motivo do
  // planner diário).
  const [row] = await db().$queryRaw<{ id: number; position: number }[]>`
    INSERT INTO week_tasks (user_id, weekday, text, position, created_week, only_week)
    VALUES (${uid}, ${wd}, ${clean},
      (SELECT COALESCE(MAX(position), 0) + 1 FROM week_tasks
       WHERE user_id = ${uid} AND weekday = ${wd}),
      ${createdWeek}, ${onlyWeek})
    RETURNING id, position`;
  if (!row) throw new Error("Não foi possível criar a tarefa");

  return {
    id: row.id,
    weekday: wd,
    text: clean,
    position: row.position,
    createdWeek,
    onlyWeek,
  };
}

/**
 * Fixa a tarefa (passa a aparecer toda semana) ou a solta na semana aberta.
 *
 * Fixar reposiciona o começo da rotina: uma tarefa que era solta há três
 * semanas não deve entrar no gráfico como se já fosse rotina naquela época.
 * Soltar não apaga as marcações das outras semanas — refixar traz o histórico
 * de volta.
 */
export async function setWeekTaskPinned(
  taskId: number,
  weekStart: string,
  pinned: boolean,
): Promise<
  Pick<WeekTask, "onlyWeek"> & Partial<Pick<WeekTask, "createdWeek">>
> {
  const { uid } = await requireUser();
  assertWeek(weekStart);

  // Soltar não mexe em `createdWeek`: a chave sai do objeto para o cliente não
  // sobrescrever o que já tinha.
  const data = pinned
    ? { onlyWeek: null, createdWeek: inicioDaRotina(weekStart) }
    : { onlyWeek: weekStart };

  const { count } = await db().weekTask.updateMany({
    where: { id: taskId, userId: uid },
    data,
  });
  assertAlterou(count);

  return data;
}

export async function setWeekTaskDone(
  taskId: number,
  weekStart: string,
  done: boolean,
) {
  const { uid } = await requireUser();
  assertWeek(weekStart);

  if (!done) {
    // Desmarcar algo que já não está lá não é erro.
    await db().weekMark.deleteMany({
      where: { taskId, weekStart, userId: uid },
    });
    return;
  }

  // O dono é conferido dentro do INSERT: a linha só existe se o SELECT achar a
  // tarefa do usuário. O `DO UPDATE` redundante (grava o mesmo user_id) existe
  // para que marcar de novo continue contando como uma linha afetada — assim
  // "zero linhas" significa apenas uma coisa: a tarefa não é de quem pediu.
  const afetadas = await db().$executeRaw`
    INSERT INTO week_marks (task_id, week_start, user_id)
    SELECT id, ${weekStart}, user_id FROM week_tasks
    WHERE id = ${taskId} AND user_id = ${uid}
    ON CONFLICT (task_id, week_start)
    DO UPDATE SET user_id = EXCLUDED.user_id`;
  assertAlterou(afetadas);
}

export async function updateWeekTaskText(taskId: number, text: string) {
  const { uid } = await requireUser();
  const clean = text.trim().slice(0, 300);
  if (!clean) return deleteWeekTask(taskId);

  const { count } = await db().weekTask.updateMany({
    where: { id: taskId, userId: uid },
    data: { text: clean },
  });
  assertAlterou(count);
}

/** Tira a tarefa da rotina — e, junto, o histórico dela (ON DELETE CASCADE). */
export async function deleteWeekTask(taskId: number) {
  const { uid } = await requireUser();
  const { count } = await db().weekTask.deleteMany({
    where: { id: taskId, userId: uid },
  });
  assertAlterou(count);
}
