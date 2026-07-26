import type { Metadata } from "next";
import DayBoard from "@/components/planner/day/DayBoard";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseDateKey } from "@/lib/dates";
import type { Task } from "./actions";

export const metadata: Metadata = { title: "Planner Diário · Lume" };

export default async function DiaPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { uid } = await requireUser();
  const { d } = await searchParams;
  const date = parseDateKey(d);

  const [day, rows] = await Promise.all([
    db().day.findUnique({
      where: { userId_date: { userId: uid, date } },
      select: { notes: true, rating: true },
    }),
    db().task.findMany({
      where: { userId: uid, date },
      select: { id: true, text: true, done: true, kind: true, position: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),
  ]);

  // `kind` é texto no banco; aqui volta a ser a união de "normal" e
  // "inegociavel" que o resto do código usa.
  const tasks = rows as Task[];

  return (
    <DayBoard
      key={date}
      date={date}
      initialNotes={day?.notes ?? ""}
      initialRating={day?.rating ?? null}
      initialTasks={tasks}
    />
  );
}
