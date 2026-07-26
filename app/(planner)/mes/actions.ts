"use server";

import { revalidatePath } from "next/cache";
import { all, run } from "@/lib/db";
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

  await run(
    `INSERT INTO habits (user_id, month_key, slot, name) VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, month_key, slot) DO UPDATE SET name = excluded.name`,
    [uid, monthKeyValue, slot, name.slice(0, 80)],
  );

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
    await run(
      `INSERT INTO habit_marks (user_id, month_key, slot, day)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [uid, monthKeyValue, slot, day],
    );
  } else {
    await run(
      `DELETE FROM habit_marks
       WHERE user_id = $1 AND month_key = $2 AND slot = $3 AND day = $4`,
      [uid, monthKeyValue, slot, day],
    );
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

  // Um único INSERT ... SELECT no lugar da transação que o SQLite pedia: a
  // cópia inteira acontece numa só ida ao banco, e atômica.
  await run(
    `INSERT INTO habits (user_id, month_key, slot, name)
     SELECT user_id, $2::text, slot, name FROM habits
     WHERE user_id = $1 AND month_key = $3 AND name <> ''
     ON CONFLICT (user_id, month_key, slot) DO UPDATE SET name = excluded.name`,
    [uid, monthKeyValue, prevKey],
  );

  revalidatePath("/mes");

  const current = await all<{ slot: number; name: string }>(
    "SELECT slot, name FROM habits WHERE user_id = $1 AND month_key = $2",
    [uid, monthKeyValue],
  );

  return Array.from(
    { length: 7 },
    (_, i) => current.find((h) => h.slot === i + 1)?.name ?? "",
  );
}
