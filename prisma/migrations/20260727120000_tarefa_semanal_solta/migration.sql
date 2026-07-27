-- Nem toda tarefa da semana é rotina. Vazio = fixa (aparece toda semana);
-- preenchido = solta, e o valor é a única semana em que ela aparece.
-- As tarefas que já existem eram todas fixas, então NULL é o padrão certo.
ALTER TABLE "week_tasks" ADD COLUMN "only_week" TEXT;
