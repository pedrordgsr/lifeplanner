-- O tipo CITEXT (texto que ignora maiúsculas) vem desta extensão. Neon e
-- Supabase já a disponibilizam; é ela que garante, no banco, que "Pedro" e
-- "pedro" não virem duas contas.
CREATE EXTENSION IF NOT EXISTS citext;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" CITEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habits" (
    "user_id" INTEGER NOT NULL,
    "month_key" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "habits_pkey" PRIMARY KEY ("user_id","month_key","slot")
);

-- CreateTable
CREATE TABLE "habit_marks" (
    "user_id" INTEGER NOT NULL,
    "month_key" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,

    CONSTRAINT "habit_marks_pkey" PRIMARY KEY ("user_id","month_key","slot","day")
);

-- CreateTable
CREATE TABLE "days" (
    "user_id" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER,

    CONSTRAINT "days_pkey" PRIMARY KEY ("user_id","date")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "done" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "years" (
    "user_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "metas" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "years_pkey" PRIMARY KEY ("user_id","year")
);

-- CreateTable
CREATE TABLE "year_marks" (
    "user_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,

    CONSTRAINT "year_marks_pkey" PRIMARY KEY ("user_id","year","month","day")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "tasks_by_day" ON "tasks"("user_id", "date", "kind", "position");

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_marks" ADD CONSTRAINT "habit_marks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "days" ADD CONSTRAINT "days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "years" ADD CONSTRAINT "years_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "year_marks" ADD CONSTRAINT "year_marks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

