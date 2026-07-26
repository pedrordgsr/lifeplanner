import "server-only";
import { Pool, type QueryResultRow } from "pg";

declare global {
  var __plannerPool: Pool | undefined;
}

/**
 * O pool é criado na primeira consulta, não na importação do módulo: assim o
 * `next build` (que avalia os módulos do servidor sem executar as páginas) não
 * quebra caso DATABASE_URL ainda não esteja configurada.
 */
function getPool(): Pool {
  if (globalThis.__plannerPool) return globalThis.__plannerPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error(
      "DATABASE_URL não está definida. Copie .env.example para .env.local (ou configure a variável na Vercel).",
    );

  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);

  const pool = new Pool({
    connectionString,
    // Pequeno de propósito: a Vercel pode manter várias instâncias vivas, e
    // cada uma abre o seu próprio pool. Poucas conexões por instância evitam
    // estourar o limite do banco — use sempre a URL *pooled* (Neon: host com
    // `-pooler`; Supabase: porta 6543).
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    // Neon e Supabase têm certificado público válido; só o Postgres local fica
    // sem TLS.
    ssl: isLocal ? undefined : { rejectUnauthorized: true },
  });

  // Sempre no global: em dev o hot reload reavalia este módulo a cada
  // alteração, e sem o cache cada recarga vazaria um pool novo.
  globalThis.__plannerPool = pool;
  return pool;
}

/** Todas as linhas da consulta. */
export async function all<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const { rows } = await getPool().query<T>(sql, params);
  return rows;
}

/** A primeira linha, ou `undefined` se a consulta não trouxe nada. */
export async function one<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | undefined> {
  const { rows } = await getPool().query<T>(sql, params);
  return rows[0];
}

/** INSERT/UPDATE/DELETE sem retorno. Devolve quantas linhas foram afetadas. */
export async function run(
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  const { rowCount } = await getPool().query(sql, params);
  return rowCount ?? 0;
}
