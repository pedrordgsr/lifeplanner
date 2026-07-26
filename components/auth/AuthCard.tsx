"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Logo from "@/components/brand/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import type { AuthState } from "@/app/(auth)/actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Um instante…" : label}
    </Button>
  );
}

export default function AuthCard({
  mode,
  action,
}: {
  mode: "login" | "registro";
  action: (state: AuthState, fd: FormData) => Promise<AuthState>;
}) {
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});
  const isLogin = mode === "login";

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-6 py-14">
      {/* Estas telas não têm cabeçalho — o botão de tema fica solto no canto. */}
      <ThemeToggle className="absolute top-5 right-5" />

      <div className="w-full max-w-[23rem]">
        <header className="mb-9 flex flex-col items-center text-center">
          {/* A marca leva de volta para a landing — é de lá que se chega aqui. */}
          <Link href="/" aria-label="Voltar para a página inicial">
            <Logo size="lg" className="flex-col gap-3" />
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {isLogin
              ? "Bom te ver de novo. Continue de onde parou."
              : "Um lugar calmo para acompanhar seus hábitos, dias e metas."}
          </p>
        </header>

        <Card className="p-7 shadow-card">
          <form action={formAction} className="space-y-5">
            <Field
              label="Usuário"
              name="username"
              autoComplete="username"
              placeholder="seu.nome"
            />
            <Field
              label="Senha"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="••••••••"
              hint={isLogin ? undefined : "Mínimo de 6 caracteres."}
            />
            {!isLogin && (
              <Field
                label="Confirmar senha"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
              />
            )}

            {state.error && (
              <p
                role="alert"
                className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger"
              >
                {state.error}
              </p>
            )}

            <Submit label={isLogin ? "Entrar" : "Criar conta"} />
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? "Ainda não tem conta? " : "Já tem uma conta? "}
          <Link
            href={isLogin ? "/registro" : "/login"}
            className="font-medium text-accent-ink underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:decoration-accent"
          >
            {isLogin ? "Criar agora" : "Entrar"}
          </Link>
        </p>
      </div>
    </main>
  );
}
