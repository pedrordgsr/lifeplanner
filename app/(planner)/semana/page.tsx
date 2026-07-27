import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import PeriodNav from "@/components/layout/PeriodNav";
import ButtonLink from "@/components/ui/ButtonLink";
import WeekBoard, { HISTORY_WEEKS } from "@/components/planner/week/WeekBoard";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatWeekRange,
  parseWeekKey,
  shiftWeek,
  todayKey,
  weekStartOf,
} from "@/lib/dates";

export const metadata: Metadata = { title: "Planejamento Semanal · Lume" };

export default async function SemanaPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const { uid } = await requireUser();
  const { w } = await searchParams;

  const weekStart = parseWeekKey(w);
  const currentWeek = weekStartOf(todayKey());
  const isCurrentWeek = weekStart === currentWeek;

  // O histórico termina na semana aberta, mas nunca depois de hoje: semanas que
  // ainda não aconteceram entrariam no gráfico como zero.
  const fim = weekStart < currentWeek ? weekStart : currentWeek;
  // Uma semana a mais de folga — quem monta o gráfico é o navegador, e o
  // fuso dele pode virar o dia (e a semana) antes do servidor.
  const inicio = shiftWeek(fim, -HISTORY_WEEKS);

  const [tasks, markRows] = await Promise.all([
    // As fixas (a rotina inteira, que vale em toda semana) e as soltas da
    // janela do histórico — o gráfico precisa das duas para contar cada semana.
    db().weekTask.findMany({
      where: {
        userId: uid,
        OR: [
          { onlyWeek: null },
          { onlyWeek: { gte: inicio, lte: fim } },
          { onlyWeek: weekStart },
        ],
      },
      select: {
        id: true,
        weekday: true,
        text: true,
        position: true,
        createdWeek: true,
        onlyWeek: true,
      },
      orderBy: [{ weekday: "asc" }, { position: "asc" }, { id: "asc" }],
    }),
    db().weekMark.findMany({
      where: {
        userId: uid,
        // A semana aberta entra sempre, mesmo estando à frente do histórico.
        OR: [{ weekStart: { gte: inicio, lte: fim } }, { weekStart }],
      },
      select: { taskId: true, weekStart: true },
    }),
  ]);

  const marks = markRows.map((m) => `${m.taskId}:${m.weekStart}`);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Planejamento semanal"
        title={formatWeekRange(weekStart)}
        subtitle="Cada dia tem a sua lista, e o alfinete decide o que é rotina: tarefa fixa volta igual toda semana; solta, fica só nesta."
        actions={
          <PeriodNav
            prevHref={`/semana?w=${shiftWeek(weekStart, -1)}`}
            nextHref={`/semana?w=${shiftWeek(weekStart, 1)}`}
            prevLabel="Semana anterior"
            nextLabel="Próxima semana"
            extra={
              !isCurrentWeek && (
                <ButtonLink href="/semana" variant="outline" size="sm">
                  Esta semana
                </ButtonLink>
              )
            }
          >
            {formatWeekRange(weekStart)}
          </PeriodNav>
        }
      />

      <WeekBoard
        key={weekStart}
        weekStart={weekStart}
        initialTasks={tasks}
        initialMarks={marks}
      />
    </div>
  );
}
