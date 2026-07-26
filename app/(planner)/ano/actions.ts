"use server";

import { run } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { daysInMonth } from "@/lib/dates";

function assertYear(year: number) {
  if (!Number.isInteger(year) || year < 1970 || year > 2999)
    throw new Error("Ano inválido");
  return year;
}

export async function saveMetas(year: number, metas: string) {
  const { uid } = await requireUser();
  assertYear(year);
  await run(
    `INSERT INTO years (user_id, year, metas) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, year) DO UPDATE SET metas = excluded.metas`,
    [uid, year, metas.slice(0, 2000)],
  );
}

export async function toggleYearMark(
  year: number,
  month: number,
  day: number,
  marked: boolean,
) {
  const { uid } = await requireUser();
  assertYear(year);
  if (!Number.isInteger(month) || month < 1 || month > 12)
    throw new Error("Mês inválido");
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month))
    throw new Error("Dia inválido");

  if (marked) {
    await run(
      `INSERT INTO year_marks (user_id, year, month, day) VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [uid, year, month, day],
    );
  } else {
    await run(
      "DELETE FROM year_marks WHERE user_id = $1 AND year = $2 AND month = $3 AND day = $4",
      [uid, year, month, day],
    );
  }
}
