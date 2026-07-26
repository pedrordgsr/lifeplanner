"use server";

import { db } from "@/lib/db";
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

/**
 * As alterações abaixo usam `updateMany`/`deleteMany` com o `userId` no filtro,
 * em vez de conferir o dono numa consulta à parte: a permissão vira parte do
 * próprio comando, sem brecha entre checar e alterar. Contagem zero significa
 * que a tarefa não existe ou não é de quem pediu — de fora, indistinguível.
 */
function assertAlterou(contagem: number) {
  if (contagem === 0) throw new Error("Tarefa não encontrada");
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

  // SQL cru de propósito: a posição sai de uma subconsulta dentro do próprio
  // INSERT, então não há janela entre ler o MAX e gravar. Em duas chamadas
  // Prisma (agregar, depois criar) duas tarefas simultâneas pegariam a mesma
  // posição.
  const [row] = await db().$queryRaw<{ id: number; position: number }[]>`
    INSERT INTO tasks (user_id, date, kind, text, done, position)
    VALUES (${uid}, ${date}, ${k}, ${clean}, 0,
      (SELECT COALESCE(MAX(position), 0) + 1 FROM tasks
       WHERE user_id = ${uid} AND date = ${date} AND kind = ${k}))
    RETURNING id, position`;
  if (!row) throw new Error("Não foi possível criar a tarefa");

  return { id: row.id, text: clean, done: 0, kind: k, position: row.position };
}

export async function setTaskDone(taskId: number, done: boolean) {
  const { uid } = await requireUser();
  const { count } = await db().task.updateMany({
    where: { id: taskId, userId: uid },
    data: { done: done ? 1 : 0 },
  });
  assertAlterou(count);
}

export async function updateTaskText(taskId: number, text: string) {
  const { uid } = await requireUser();
  const clean = text.trim().slice(0, 300);
  if (!clean) return deleteTask(taskId);

  const { count } = await db().task.updateMany({
    where: { id: taskId, userId: uid },
    data: { text: clean },
  });
  assertAlterou(count);
}

export async function deleteTask(taskId: number) {
  const { uid } = await requireUser();
  const { count } = await db().task.deleteMany({
    where: { id: taskId, userId: uid },
  });
  assertAlterou(count);
}

export async function saveNotes(date: string, notes: string) {
  const { uid } = await requireUser();
  assertDate(date);
  const texto = notes.slice(0, 5000);
  await db().day.upsert({
    where: { userId_date: { userId: uid, date } },
    create: { userId: uid, date, notes: texto },
    update: { notes: texto },
  });
}

export async function saveRating(date: string, rating: number | null) {
  const { uid } = await requireUser();
  assertDate(date);
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5))
    throw new Error("Avaliação inválida");

  await db().day.upsert({
    where: { userId_date: { userId: uid, date } },
    create: { userId: uid, date, rating },
    update: { rating },
  });
}

/** Move as tarefas não concluídas de um dia para outro. */
export async function carryOverPending(fromDate: string, toDate: string) {
  const { uid } = await requireUser();
  assertDate(fromDate);
  assertDate(toDate);
  if (fromDate === toDate) return 0;

  // SQL cru de propósito: reposicionar em lote é trabalho de conjunto, não de
  // laço. As CTEs enxergam o estado anterior ao UPDATE, então `ultima` é a
  // última posição do dia de destino antes da mudança, e `ordem` empilha as
  // tarefas movidas logo depois dela, preservando a ordem original dentro de
  // cada tipo. Em Prisma seria uma leitura mais um UPDATE por tarefa.
  return db().$executeRaw`
    WITH pendentes AS (
      SELECT id, kind,
             ROW_NUMBER() OVER (PARTITION BY kind ORDER BY position, id) AS ordem
      FROM tasks
      WHERE user_id = ${uid} AND date = ${fromDate} AND done = 0
    ),
    destino AS (
      SELECT kind, MAX(position) AS ultima
      FROM tasks
      WHERE user_id = ${uid} AND date = ${toDate}
      GROUP BY kind
    )
    UPDATE tasks t
    SET date = ${toDate}, position = COALESCE(d.ultima, 0) + p.ordem
    FROM pendentes p
    LEFT JOIN destino d ON d.kind = p.kind
    WHERE t.id = p.id`;
}
