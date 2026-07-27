"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { MAX_HABITS, type HabitItem } from "@/lib/habits";

const MONTH_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function assertMonthKey(key: string) {
  if (!MONTH_KEY_RE.test(key)) throw new Error("Mês inválido");
  return key;
}

/**
 * O slot é o identificador do hábito dentro do mês, não uma posição de 1 a 7:
 * ele só precisa ser um inteiro positivo. O limite alto é para barrar lixo.
 */
function assertSlot(slot: number) {
  if (!Number.isInteger(slot) || slot < 1 || slot > 100_000)
    throw new Error("Hábito inválido");
  return slot;
}

/** Colisão de chave única do Postgres, via Prisma. */
function isDuplicateKey(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

async function listHabits(uid: number, monthKeyValue: string) {
  return db().habit.findMany({
    where: { userId: uid, monthKey: monthKeyValue },
    select: { slot: true, name: true },
    orderBy: { slot: "asc" },
  });
}

/** Cria um hábito vazio no fim da lista e devolve o slot dele. */
export async function addHabit(monthKeyValue: string): Promise<HabitItem> {
  const { uid } = await requireUser();
  assertMonthKey(monthKeyValue);

  const total = await db().habit.count({
    where: { userId: uid, monthKey: monthKeyValue },
  });
  if (total >= MAX_HABITS)
    throw new Error(`Máximo de ${MAX_HABITS} hábitos por mês.`);

  // Dois cliques quase simultâneos calculam o mesmo slot; o banco recusa o
  // duplicado e a próxima volta pega o número seguinte.
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const { _max } = await db().habit.aggregate({
      where: { userId: uid, monthKey: monthKeyValue },
      _max: { slot: true },
    });
    const slot = (_max.slot ?? 0) + 1;

    try {
      await db().habit.create({
        data: { userId: uid, monthKey: monthKeyValue, slot, name: "" },
      });
      revalidatePath("/mes");
      return { slot, name: "" };
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
    }
  }

  throw new Error("Não foi possível criar o hábito. Tente de novo.");
}

/** Apaga o hábito e todas as marcações dele no mês. */
export async function removeHabit(monthKeyValue: string, slot: number) {
  const { uid } = await requireUser();
  assertMonthKey(monthKeyValue);
  assertSlot(slot);

  const where = { userId: uid, monthKey: monthKeyValue, slot };
  await db().$transaction([
    db().habitMark.deleteMany({ where }),
    db().habit.deleteMany({ where }),
  ]);

  revalidatePath("/mes");
}

export async function saveHabitName(
  monthKeyValue: string,
  slot: number,
  name: string,
) {
  const { uid } = await requireUser();
  assertMonthKey(monthKeyValue);
  assertSlot(slot);

  // `updateMany` e não `upsert`: se o hábito acabou de ser apagado (o blur do
  // campo dispara antes do clique no ×), renomear não pode ressuscitá-lo.
  await db().habit.updateMany({
    where: { userId: uid, monthKey: monthKeyValue, slot },
    data: { name: name.slice(0, 80) },
  });

  revalidatePath("/mes");
}

export async function toggleHabitMark(
  monthKeyValue: string,
  slot: number,
  day: number,
  done: boolean,
) {
  const { uid } = await requireUser();
  assertMonthKey(monthKeyValue);
  assertSlot(slot);
  if (!Number.isInteger(day) || day < 1 || day > 31)
    throw new Error("Dia inválido");

  if (done) {
    await db().habitMark.upsert({
      where: {
        userId_monthKey_slot_day: {
          userId: uid,
          monthKey: monthKeyValue,
          slot,
          day,
        },
      },
      create: { userId: uid, monthKey: monthKeyValue, slot, day },
      update: {},
    });
  } else {
    await db().habitMark.deleteMany({
      where: { userId: uid, monthKey: monthKeyValue, slot, day },
    });
  }
  // Sem revalidatePath: o cliente já aplicou a mudança de forma otimista.
}

/**
 * Traz os hábitos do mês anterior — inclusive a quantidade deles. Os hábitos
 * que já existem no mês são mantidos (apagá-los levaria junto as marcações);
 * o que a cópia faz é criar os que faltam e atualizar os nomes.
 */
export async function copyHabitsFromPreviousMonth(
  monthKeyValue: string,
): Promise<HabitItem[]> {
  const { uid } = await requireUser();
  assertMonthKey(monthKeyValue);

  const [y, m] = monthKeyValue.split("-").map(Number);
  const prev = new Date(y, m - 2, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  const [anteriores, atuais] = await Promise.all([
    listHabits(uid, prevKey),
    listHabits(uid, monthKeyValue),
  ]);

  const existentes = new Set(atuais.map((h) => h.slot));
  let espaco = MAX_HABITS - atuais.length;
  const aCopiar: HabitItem[] = [];
  for (const h of anteriores) {
    if (existentes.has(h.slot)) {
      aCopiar.push(h); // já existe aqui: a cópia só atualiza o nome
    } else if (espaco > 0) {
      aCopiar.push(h);
      espaco -= 1;
    }
  }

  // $transaction garante que ou copia tudo ou nada.
  await db().$transaction(
    aCopiar.map((h) =>
      db().habit.upsert({
        where: {
          userId_monthKey_slot: {
            userId: uid,
            monthKey: monthKeyValue,
            slot: h.slot,
          },
        },
        create: {
          userId: uid,
          monthKey: monthKeyValue,
          slot: h.slot,
          name: h.name,
        },
        update: { name: h.name },
      }),
    ),
  );

  revalidatePath("/mes");

  return listHabits(uid, monthKeyValue);
}
