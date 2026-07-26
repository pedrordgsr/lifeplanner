"use server";

import { one, run } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export type TaskKind = "normal" | "inegociavel";
export type Task = {
  id: number;
  text: string;
  done: number;
  kind: TaskKind;
  position: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function assertDate(date: string) {
  if (!DATE_RE.test(date)) throw new Error("Data inválida");
  return date;
}

function assertKind(kind: string): TaskKind {
  if (kind !== "normal" && kind !== "inegociavel")
    throw new Error("Tipo de tarefa inválido");
  return kind;
}

/** Garante que a tarefa pertence ao usuário logado antes de mexer nela. */
async function ownedTask(uid: number, taskId: number) {
  const row = await one("SELECT id FROM tasks WHERE id = $1 AND user_id = $2", [
    taskId,
    uid,
  ]);
  if (!row) throw new Error("Tarefa não encontrada");
}

export async function addTask(
  date: string,
  kind: string,
  text: string,
): Promise<Task> {
  const { uid } = await requireUser();
  assertDate(date);
  const k = assertKind(kind);
  const clean = text.trim().slice(0, 300);
  if (!clean) throw new Error("Tarefa vazia");

  // A posição sai de uma subconsulta no próprio INSERT: uma ida ao banco só, e
  // sem janela entre ler o MAX e gravar.
  const row = await one<{ id: number; position: number }>(
    `INSERT INTO tasks (user_id, date, kind, text, done, position)
     VALUES ($1, $2, $3, $4, 0,
       (SELECT COALESCE(MAX(position), 0) + 1 FROM tasks
        WHERE user_id = $1 AND date = $2 AND kind = $3))
     RETURNING id, position`,
    [uid, date, k, clean],
  );
  if (!row) throw new Error("Não foi possível criar a tarefa");

  return { id: row.id, text: clean, done: 0, kind: k, position: row.position };
}

export async function setTaskDone(taskId: number, done: boolean) {
  const { uid } = await requireUser();
  await ownedTask(uid, taskId);
  await run("UPDATE tasks SET done = $1 WHERE id = $2 AND user_id = $3", [
    done ? 1 : 0,
    taskId,
    uid,
  ]);
}

export async function updateTaskText(taskId: number, text: string) {
  const { uid } = await requireUser();
  await ownedTask(uid, taskId);
  const clean = text.trim().slice(0, 300);
  if (!clean) {
    await run("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [taskId, uid]);
    return;
  }
  await run("UPDATE tasks SET text = $1 WHERE id = $2 AND user_id = $3", [
    clean,
    taskId,
    uid,
  ]);
}

export async function deleteTask(taskId: number) {
  const { uid } = await requireUser();
  await ownedTask(uid, taskId);
  await run("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [taskId, uid]);
}

export async function saveNotes(date: string, notes: string) {
  const { uid } = await requireUser();
  assertDate(date);
  await run(
    `INSERT INTO days (user_id, date, notes) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE SET notes = excluded.notes`,
    [uid, date, notes.slice(0, 5000)],
  );
}

export async function saveRating(date: string, rating: number | null) {
  const { uid } = await requireUser();
  assertDate(date);
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5))
    throw new Error("Avaliação inválida");

  await run(
    `INSERT INTO days (user_id, date, rating) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE SET rating = excluded.rating`,
    [uid, date, rating],
  );
}

/** Move as tarefas não concluídas de um dia para outro. */
export async function carryOverPending(fromDate: string, toDate: string) {
  const { uid } = await requireUser();
  assertDate(fromDate);
  assertDate(toDate);
  if (fromDate === toDate) return 0;

  // Tudo num comando só, no lugar do laço em transação que o SQLite exigia. As
  // CTEs enxergam o estado anterior ao UPDATE, então `ultima` é a última
  // posição do dia de destino antes da mudança, e `ordem` empilha as tarefas
  // movidas logo depois dela, preservando a ordem original dentro de cada tipo.
  return run(
    `WITH pendentes AS (
       SELECT id, kind,
              ROW_NUMBER() OVER (PARTITION BY kind ORDER BY position, id) AS ordem
       FROM tasks
       WHERE user_id = $1 AND date = $2 AND done = 0
     ),
     destino AS (
       SELECT kind, MAX(position) AS ultima
       FROM tasks
       WHERE user_id = $1 AND date = $3
       GROUP BY kind
     )
     UPDATE tasks t
     SET date = $3, position = COALESCE(d.ultima, 0) + p.ordem
     FROM pendentes p
     LEFT JOIN destino d ON d.kind = p.kind
     WHERE t.id = p.id`,
    [uid, fromDate, toDate],
  );
}
