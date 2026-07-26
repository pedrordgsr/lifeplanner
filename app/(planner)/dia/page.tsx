import type { Metadata } from "next";
import DayBoard from "@/components/planner/day/DayBoard";
import { requireUser } from "@/lib/auth";
import { all, one } from "@/lib/db";
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

  const [day, tasks] = await Promise.all([
    one<{ notes: string; rating: number | null }>(
      "SELECT notes, rating FROM days WHERE user_id = $1 AND date = $2",
      [uid, date],
    ),
    all<Task>(
      `SELECT id, text, done, kind, position FROM tasks
       WHERE user_id = $1 AND date = $2
       ORDER BY position, id`,
      [uid, date],
    ),
  ]);

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
