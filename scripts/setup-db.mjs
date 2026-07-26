// Aplica lib/schema.sql no banco apontado por DATABASE_URL.
// Rode com `npm run db:setup` (local) ou passando a URL de produção:
//   DATABASE_URL='postgres://...' npm run db:setup
//
// É idempotente: tudo é CREATE ... IF NOT EXISTS, então rodar de novo depois de
// um deploy não apaga nem duplica nada.
import { readFile } from "node:fs/promises";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL não definida.\n" +
      "Local: copie .env.example para .env.local e preencha.\n" +
      "Produção: DATABASE_URL='postgres://...' npm run db:setup",
  );
  process.exit(1);
}

const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
const schema = await readFile(new URL("../lib/schema.sql", import.meta.url), "utf8");

const client = new Client({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: true },
});

await client.connect();
try {
  await client.query(schema);
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  console.log("Schema aplicado. Tabelas:", rows.map((r) => r.table_name).join(", "));
} finally {
  await client.end();
}
