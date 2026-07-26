import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Encerra a sessão e volta para o login. Existe como Route Handler porque um
 * Server Component não pode apagar cookies — é para cá que `requireUser()`
 * manda quem tem um cookie válido apontando para um usuário que não existe mais.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";

  const res = NextResponse.redirect(url);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
