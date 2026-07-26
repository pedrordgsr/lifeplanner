import { SignJWT, jwtVerify } from "jose";

// Edge-safe: usado tanto no proxy quanto no servidor.
//
// Em produção a variável é obrigatória: com um segredo padrão e público,
// qualquer pessoa assinaria um cookie de sessão válido e entraria como
// qualquer usuário. Falhar aqui, alto e claro, é melhor do que subir aberto.
const DEV_SECRET = "dev-secret-troque-em-producao-xxxxxxxxxxxxx";
const configured = process.env.SESSION_SECRET;

if (process.env.NODE_ENV === "production" && (configured?.length ?? 0) < 32)
  throw new Error(
    "SESSION_SECRET ausente ou curta demais (mínimo 32 caracteres). Gere uma com `openssl rand -base64 32` e configure na Vercel.",
  );

const secret = new TextEncoder().encode(configured ?? DEV_SECRET);

export const SESSION_COOKIE = "planner_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export type SessionPayload = { uid: number; username: string };

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret);
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.uid !== "number" || typeof payload.username !== "string")
      return null;
    return { uid: payload.uid, username: payload.username };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
