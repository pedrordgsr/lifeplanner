"use server";

import { db } from "@/lib/db";
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
  const texto = metas.slice(0, 2000);
  await db().year.upsert({
    where: { userId_year: { userId: uid, year } },
    create: { userId: uid, year, metas: texto },
    update: { metas: texto },
  });
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

  const chave = { userId_year_month_day: { userId: uid, year, month, day } };

  if (marked) {
    // A tabela é só a chave primária, então `update: {}` faz o papel do
    // "insere se não existir" — marcar duas vezes não é erro.
    await db().yearMark.upsert({
      where: chave,
      create: { userId: uid, year, month, day },
      update: {},
    });
  } else {
    // deleteMany em vez de delete: desmarcar algo que já não está lá não deve
    // explodir.
    await db().yearMark.deleteMany({
      where: { userId: uid, year, month, day },
    });
  }
}
