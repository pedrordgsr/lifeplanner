"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const MONTH_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function assertMonthKey(key: string) {
  if (!MONTH_KEY_RE.test(key)) throw new Error("Mês inválido");
  return key;
}

function assertSlot(slot: number) {
  if (!Number.isInteger(slot) || slot < 1 || slot > 7)
    throw new Error("Hábito inválido");
  return slot;
}

export async function saveHabitName(
  monthKeyValue: string,
  slot: number,
  name: string,
) {
  const { uid } = await requireUser();
  assertMonthKey(monthKeyValue);
  assertSlot(slot);

  const nome = name.slice(0, 80);
  await db().habit.upsert({
    where: {
      userId_monthKey_slot: { userId: uid, monthKey: monthKeyValue, slot },
    },
    create: { userId: uid, monthKey: monthKeyValue, slot, name: nome },
    update: { name: nome },
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

/** Copia os nomes dos hábitos do mês anterior e devolve os 7 nomes resultantes. */
export async function copyHabitsFromPreviousMonth(monthKeyValue: string) {
  const { uid } = await requireUser();
  assertMonthKey(monthKeyValue);

  const [y, m] = monthKeyValue.split("-").map(Number);
  const prev = new Date(y, m - 2, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  const anteriores = await db().habit.findMany({
    where: { userId: uid, monthKey: prevKey, name: { not: "" } },
    select: { slot: true, name: true },
  });

  // No máximo 7 linhas, e $transaction garante que ou copia tudo ou nada.
  await db().$transaction(
    anteriores.map((h) =>
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

  const current = await db().habit.findMany({
    where: { userId: uid, monthKey: monthKeyValue },
    select: { slot: true, name: true },
  });

  return Array.from(
    { length: 7 },
    (_, i) => current.find((h) => h.slot === i + 1)?.name ?? "",
  );
}
