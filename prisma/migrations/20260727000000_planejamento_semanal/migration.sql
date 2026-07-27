-- O Mapa do Ano deu lugar ao Planejamento Semanal. As duas tabelas dele saem:
-- as metas e as marcações de dia do ano não têm equivalente na tela nova, e
-- são descartadas junto.
DROP TABLE "year_marks";
DROP TABLE "years";

-- CreateTable
CREATE TABLE "week_tasks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_week" TEXT NOT NULL,

    CONSTRAINT "week_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "week_marks" (
    "task_id" INTEGER NOT NULL,
    "week_start" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "week_marks_pkey" PRIMARY KEY ("task_id","week_start")
);

-- CreateIndex
CREATE INDEX "week_tasks_by_weekday" ON "week_tasks"("user_id", "weekday", "position");

-- CreateIndex
CREATE INDEX "week_marks_by_week" ON "week_marks"("user_id", "week_start");

-- AddForeignKey
ALTER TABLE "week_tasks" ADD CONSTRAINT "week_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "week_marks" ADD CONSTRAINT "week_marks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "week_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "week_marks" ADD CONSTRAINT "week_marks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
