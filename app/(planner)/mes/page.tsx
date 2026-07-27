import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import PeriodNav from "@/components/layout/PeriodNav";
import MonthBoard from "@/components/planner/month/MonthBoard";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  MONTH_NAMES,
  daysInMonth,
  monthKey,
  parseMonthKey,
  shiftMonth,
} from "@/lib/dates";

export const metadata: Metadata = { title: "Mapa do Mês · Lume" };

export default async function MesPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { uid } = await requireUser();
  const { m } = await searchParams;
  const { year, month } = parseMonthKey(m);
  const key = monthKey(year, month);
  const days = daysInMonth(year, month);

  const [habits, markRows] = await Promise.all([
    db().habit.findMany({
      where: { userId: uid, monthKey: key },
      select: { slot: true, name: true },
      orderBy: { slot: "asc" },
    }),
    db().habitMark.findMany({
      where: { userId: uid, monthKey: key },
      select: { slot: true, day: true },
    }),
  ]);

  // A lista de hábitos do mês é o que existe no banco — nem sempre sete. Marcas
  // de hábitos apagados podem sobrar de um mês antigo; ficam de fora.
  const slots = new Set(habits.map((h) => h.slot));
  const marks = markRows
    .filter((r) => r.day <= days && slots.has(r.slot))
    .map((r) => `${r.slot}:${r.day}`);

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mapa do mês"
        title={`${MONTH_NAMES[month - 1]} de ${year}`}
        subtitle="Marque os hábitos de hoje com um toque, ou preencha qualquer dia na grade. A roda mostra o mês inteiro."
        actions={
          <PeriodNav
            prevHref={`/mes?m=${monthKey(prev.year, prev.month)}`}
            nextHref={`/mes?m=${monthKey(next.year, next.month)}`}
            prevLabel="Mês anterior"
            nextLabel="Próximo mês"
          >
            {MONTH_NAMES[month - 1]} {year}
          </PeriodNav>
        }
      />

      <MonthBoard
        key={key}
        monthKey={key}
        year={year}
        month={month}
        days={days}
        initialHabits={habits}
        initialMarks={marks}
      />
    </div>
  );
}
