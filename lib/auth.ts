import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { one } from "./db";
import {
  SESSION_COOKIE,
  signSession,
  verifySession,
  sessionCookieOptions,
  type SessionPayload,
} from "./session";

export type User = { id: number; username: string; password_hash: string };

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  // Um cookie assinado ainda pode apontar para um usuário que não existe mais
  // (banco recriado, conta removida). Confere sempre no banco.
  const user = await one<{ username: string }>(
    "SELECT username FROM users WHERE id = $1",
    [session.uid],
  );
  if (!user || user.username.toLowerCase() !== session.username.toLowerCase())
    return null;

  return session;
}

/**
 * Sessão obrigatória. Manda para /logout em vez de /login porque o cookie pode
 * estar assinado e válido, mas apontando para um usuário inexistente — nesse
 * caso /login devolveria a pessoa para cá e o redirecionamento entraria em loop.
 */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/logout");
  return session;
}

export async function startSession(user: { id: number; username: string }) {
  const jar = await cookies();
  jar.set(
    SESSION_COOKIE,
    await signSession({ uid: user.id, username: user.username }),
    sessionCookieOptions,
  );
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Busca sem diferenciar maiúsculas, igual ao índice único de `lower(username)`. */
export async function findUser(username: string): Promise<User | undefined> {
  return one<User>(
    "SELECT id, username, password_hash FROM users WHERE lower(username) = lower($1)",
    [username.trim()],
  );
}

/** Devolve `null` se o nome já estiver em uso. */
export async function createUser(username: string, password: string) {
  const name = username.trim();
  const hash = await bcrypt.hash(password, 10);

  try {
    const row = await one<{ id: number }>(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
      [name, hash],
    );
    return row ? { id: row.id, username: name } : null;
  } catch (err) {
    // 23505 = unique_violation: alguém registrou o mesmo nome entre a checagem
    // e este INSERT. O índice único é a garantia real, não a checagem.
    if ((err as { code?: string }).code === "23505") return null;
    throw err;
  }
}

export function checkPassword(user: User, password: string) {
  return bcrypt.compare(password, user.password_hash);
}
