"use server";

import { redirect } from "next/navigation";
import {
  checkPassword,
  createUser,
  endSession,
  findUser,
  startSession,
} from "@/lib/auth";

export type AuthState = { error?: string };

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,24}$/;

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) return { error: "Preencha usuário e senha." };

  const user = await findUser(username);
  // Mensagem genérica: não revela se o usuário existe.
  if (!user || !(await checkPassword(user, password)))
    return { error: "Usuário ou senha incorretos." };

  await startSession(user);
  redirect("/mes");
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!USERNAME_RE.test(username))
    return {
      error: "Usuário: 3 a 24 caracteres (letras, números, . _ -).",
    };
  if (password.length < 6)
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };
  if (await findUser(username)) return { error: "Esse usuário já existe." };

  const user = await createUser(username, password);
  if (!user) return { error: "Esse usuário já existe." };

  await startSession(user);
  redirect("/mes");
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
