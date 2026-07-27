"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import ThemeChoice from "@/components/theme/ThemeChoice";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import { Close, Exit, Key, Pencil, Sun } from "@/components/ui/Icons";
import { logoutAction } from "@/app/(auth)/actions";
import {
  changePasswordAction,
  renameAccountAction,
  type AccountState,
} from "@/app/(planner)/conta/actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="soft" disabled={pending}>
      {pending ? "Um instante…" : label}
    </Button>
  );
}

/** Erro ou confirmação da última submissão, no mesmo lugar dos dois casos. */
function Feedback({ error, ok }: AccountState) {
  if (!error && !ok) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={
        error
          ? "rounded-xl bg-danger-soft px-3 py-2 text-xs leading-relaxed text-danger"
          : "rounded-xl bg-accent-soft px-3 py-2 text-xs leading-relaxed text-accent-ink"
      }
    >
      {error ?? ok}
    </p>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line pt-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
        <span className="text-muted">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * Ajustes da conta em uma folha: no celular sobe do rodapé (perto do polegar,
 * já que é de lá que ela é aberta); a partir do `sm` vira uma caixa central.
 */
export default function ProfileSheet({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  const [renameState, renameAction] = useActionState<AccountState, FormData>(
    renameAccountAction,
    {},
  );
  const [passwordState, passwordAction] = useActionState<AccountState, FormData>(
    changePasswordAction,
    {},
  );

  useEffect(() => {
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Trava a rolagem de fundo: no celular, rolar "através" da folha é o
    // incômodo clássico das folhas modais.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-sheet-title"
        tabIndex={-1}
        className={
          "animate-sheet-in relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[1.75rem] border border-line bg-surface " +
          "px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-float outline-none " +
          "sm:max-h-[85dvh] sm:max-w-md sm:rounded-[1.75rem] sm:p-6"
        }
      >
        <header className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft text-base font-medium text-accent-ink">
            {username.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="label-eyebrow">Sua conta</p>
            <h2
              id="profile-sheet-title"
              className="truncate text-lg font-semibold text-ink"
            >
              @{username}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar perfil"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-surface-sunk hover:text-ink"
          >
            <Close className="h-4 w-4" />
          </button>
        </header>

        <div className="mt-5 space-y-5">
          <Section icon={<Sun />} title="Tema">
            <ThemeChoice />
          </Section>

          <Section icon={<Pencil />} title="Nome de usuário">
            <form action={renameAction} className="space-y-3">
              <Field
                // Remonta com o valor novo quando a troca dá certo.
                key={username}
                label="Novo nome"
                name="username"
                defaultValue={username}
                autoComplete="username"
                hint="3 a 24 caracteres: letras, números, ponto, hífen ou _."
              />
              <Feedback {...renameState} />
              <Submit label="Salvar nome" />
            </form>
          </Section>

          <Section icon={<Key />} title="Senha">
            <form action={passwordAction} className="space-y-3">
              <Field
                label="Senha atual"
                name="current"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <Field
                label="Nova senha"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                hint="Mínimo de 6 caracteres."
              />
              <Field
                label="Confirmar nova senha"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
              />
              <Feedback {...passwordState} />
              <Submit label="Salvar senha" />
            </form>
          </Section>

          {/* No celular o cabeçalho não existe mais, então o convite para
              instalar o app só tem este lugar para morar. */}
          <InstallAppButton className="border-t border-line pt-5 sm:hidden" />

          <form action={logoutAction} className="border-t border-line pt-5">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-danger transition-colors duration-200 hover:border-danger/40 hover:bg-danger-soft"
            >
              <Exit className="h-4 w-4" />
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
