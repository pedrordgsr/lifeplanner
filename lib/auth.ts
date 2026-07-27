import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import {
  SESSION_COOKIE,
  signSession,
  verifySession,
  sessionCookieOptions,
  type SessionPayload,
} from "./session";

export type User = { id: number; username: string; passwordHash: string };

/** Regra do nome de usuário — vale no registro e ao renomear a conta. */
export const USERNAME_RE = /^[a-zA-Z0-9._-]{3,24}$/;

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  // Um cookie assinado ainda pode apontar para um usuário que não existe mais
  // (banco recriado, conta removida). Confere sempre no banco.
  const user = await db().user.findUnique({
    where: { id: session.uid },
    select: { username: true },
  });
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

/** A coluna é `citext`, então a busca já ignora maiúsculas. */
export async function findUser(username: string): Promise<User | null> {
  return db().user.findUnique({
    where: { username: username.trim() },
    select: { id: true, username: true, passwordHash: true },
  });
}

/** Busca pelo id da sessão — para conferir a senha antes de mexer na conta. */
export async function findUserById(id: number): Promise<User | null> {
  return db().user.findUnique({
    where: { id },
    select: { id: true, username: true, passwordHash: true },
  });
}

/** Devolve `null` se o nome já estiver em uso. */
export async function createUser(username: string, password: string) {
  const name = username.trim();
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await db().user.create({
      data: { username: name, passwordHash },
      select: { id: true, username: true },
    });
  } catch (err) {
    // P2002 = violação de unicidade: alguém registrou o mesmo nome entre a
    // checagem e este INSERT. O índice único é a garantia real, não a checagem.
    if ((err as { code?: string }).code === "P2002") return null;
    throw err;
  }
}

export function checkPassword(user: User, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

/**
 * Troca o nome de usuário. Devolve `null` se o nome já for de outra conta —
 * quem chama precisa reabrir a sessão, porque o cookie carrega o nome antigo
 * e `getSession()` o confere contra o banco.
 */
export async function renameUser(id: number, username: string) {
  try {
    return await db().user.update({
      where: { id },
      data: { username: username.trim() },
      select: { id: true, username: true },
    });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") return null;
    throw err;
  }
}

export async function setPassword(id: number, password: string) {
  await db().user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
}
