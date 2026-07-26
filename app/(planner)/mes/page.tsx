import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import PeriodNav from "@/components/layout/PeriodNav";
import MonthBoard from "@/components/planner/month/MonthBoard";
import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
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

  const [habitRows, markRows] = await Promise.all([
    all<{ slot: number; name: string }>(
      "SELECT slot, name FROM habits WHERE user_id = $1 AND month_key = $2",
      [uid, key],
    ),
    all<{ slot: number; day: number }>(
      "SELECT slot, day FROM habit_marks WHERE user_id = $1 AND month_key = $2",
      [uid, key],
    ),
  ]);

  const names = Array.from(
    { length: 7 },
    (_, i) => habitRows.find((h) => h.slot === i + 1)?.name ?? "",
  );
  const marks = markRows
    .filter((r) => r.day <= days)
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
        initialNames={names}
        initialMarks={marks}
      />
    </div>
  );
}
