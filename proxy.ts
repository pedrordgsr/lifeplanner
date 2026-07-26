import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/registro"];
// Passam sempre, logado ou não: "/logout" apaga um cookie de sessão inválido e
// "/" é a landing — quem já entrou vê a mesma página, com os botões apontando
// para o planner em vez do login.
const ALWAYS_ALLOWED = ["/logout", "/"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (ALWAYS_ALLOWED.includes(pathname)) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!session && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (session && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/mes";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|webmanifest)$).*)",
  ],
};
