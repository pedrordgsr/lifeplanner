import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __plannerPrisma: PrismaClient | undefined;
}

/**
 * O client é criado na primeira consulta, não na importação do módulo: assim o
 * `next build` (que avalia os módulos do servidor sem executar as páginas) não
 * quebra caso DATABASE_URL ainda não esteja configurada.
 */
function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error(
      "DATABASE_URL não está definida. Copie .env.example para .env.local (ou configure a variável na Vercel).",
    );

  // O Prisma 7 fala com o Postgres através de um driver adapter — aqui, o `pg`.
  //
  // TLS não é configurado aqui de propósito: quem manda é o `sslmode` da
  // própria DATABASE_URL, como em qualquer cliente Postgres. Neon e Supabase
  // entregam a URL com `sslmode=require`; um Postgres local sem TLS não deve
  // levar `sslmode` nenhum.
  const adapter = new PrismaPg({
    connectionString,
    // Pequeno de propósito: a Vercel pode manter várias instâncias vivas, e
    // cada uma abre o seu próprio pool. Poucas conexões por instância evitam
    // estourar o limite do banco — use sempre a URL *pooled* (Neon: host com
    // `-pooler`; Supabase: porta 6543).
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  return new PrismaClient({ adapter });
}

/**
 * Sempre no global: em dev o hot reload reavalia este módulo a cada alteração,
 * e sem o cache cada recarga vazaria um pool de conexões novo.
 */
export function db(): PrismaClient {
  globalThis.__plannerPrisma ??= createClient();
  return globalThis.__plannerPrisma;
}
