import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import PeriodNav from "@/components/layout/PeriodNav";
import YearBoard from "@/components/planner/year/YearBoard";
import { requireUser } from "@/lib/auth";
import { all, one } from "@/lib/db";

export const metadata: Metadata = { title: "Mapa do Ano · Lume" };

export default async function AnoPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string }>;
}) {
  const { uid } = await requireUser();
  const { y } = await searchParams;

  const parsed = Number(y);
  const year =
    Number.isInteger(parsed) && parsed >= 1970 && parsed <= 2999
      ? parsed
      : new Date().getFullYear();

  const [row, markRows] = await Promise.all([
    one<{ metas: string }>(
      "SELECT metas FROM years WHERE user_id = $1 AND year = $2",
      [uid, year],
    ),
    all<{ month: number; day: number }>(
      "SELECT month, day FROM year_marks WHERE user_id = $1 AND year = $2",
      [uid, year],
    ),
  ]);

  const marks = markRows.map((m) => `${m.month}:${m.day}`);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mapa do ano"
        title={String(year)}
        subtitle="Marque cada dia em que você deu um passo na direção das suas metas."
        actions={
          <PeriodNav
            prevHref={`/ano?y=${year - 1}`}
            nextHref={`/ano?y=${year + 1}`}
            prevLabel="Ano anterior"
            nextLabel="Próximo ano"
          >
            {year}
          </PeriodNav>
        }
      />

      <YearBoard
        key={year}
        year={year}
        initialMetas={row?.metas ?? ""}
        initialMarks={marks}
      />
    </div>
  );
}
