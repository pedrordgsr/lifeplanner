"use server";

import {
  USERNAME_RE,
  checkPassword,
  findUserById,
  renameUser,
  requireUser,
  setPassword,
  startSession,
} from "@/lib/auth";

/** Um formulário de conta termina em erro ou em uma confirmação curta. */
export type AccountState = { error?: string; ok?: string };

export async function renameAccountAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const { uid } = await requireUser();
  const username = String(formData.get("username") ?? "").trim();

  if (!USERNAME_RE.test(username))
    return { error: "Usuário: 3 a 24 caracteres (letras, números, . _ -)." };

  const user = await findUserById(uid);
  if (!user) return { error: "Sessão expirada. Entre de novo." };
  if (user.username === username) return { ok: "Esse já é o seu nome." };

  const updated = await renameUser(uid, username);
  if (!updated) return { error: "Esse usuário já existe." };

  // O cookie guarda o nome antigo e `getSession()` o confere contra o banco:
  // sem reassinar aqui, a próxima navegação cairia em /logout.
  await startSession(updated);

  // Trocar o cookie já faz o Next re-renderizar a rota, então o cabeçalho e a
  // folha de perfil recebem o nome novo sem revalidação explícita.
  return { ok: "Nome atualizado." };
}

export async function changePasswordAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const { uid } = await requireUser();
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const user = await findUserById(uid);
  if (!user) return { error: "Sessão expirada. Entre de novo." };
  // Confere a senha atual antes de qualquer validação da nova: a sessão sozinha
  // não deve bastar para trocar a senha em um aparelho deixado desbloqueado.
  if (!(await checkPassword(user, current)))
    return { error: "Senha atual incorreta." };

  if (password.length < 6)
    return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };

  await setPassword(uid, password);
  return { ok: "Senha atualizada." };
}
