import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// O Next lê .env.local; o dotenv, por padrão, só lê .env. Sem esta linha a CLI
// do Prisma não enxergaria a mesma DATABASE_URL que o app usa.
loadEnv({ path: [".env.local", ".env"], quiet: true });

// Configuração da CLI do Prisma (migrations, studio). O app em si não lê este
// arquivo: em runtime a conexão vem do adapter em lib/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    // Opcional: só é preciso quando o banco de desenvolvimento não permite que
    // o Prisma crie sozinho o banco temporário que ele usa para gerar
    // migrations. Em branco, ele se vira.
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
