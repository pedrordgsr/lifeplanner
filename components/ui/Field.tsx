"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const INPUT = cn(
  "w-full rounded-xl border border-line bg-surface-soft px-3.5 py-2.5",
  "text-base text-ink placeholder:text-faint sm:text-[0.9375rem]",
  "transition-colors duration-200 outline-none",
  "hover:border-line-strong focus:border-accent focus:bg-surface",
);

/** Campo rotulado dos formulários de conta. */
export default function Field({
  label,
  hint,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      <input className={cn(INPUT, "mt-1.5", className)} {...rest} />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

const INLINE = cn(
  "min-w-0 flex-1 rounded-md bg-transparent px-1.5 py-1 text-base sm:text-[0.9375rem]",
  "outline-none placeholder:text-faint",
  "transition-colors duration-200 hover:bg-surface-sunk focus:bg-surface-sunk",
);

/** Campo de uma linha, sem moldura, para editar direto no lugar. */
export function InlineInput({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(INLINE, className)} {...rest} />;
}

/**
 * Igual ao InlineInput, mas o texto quebra em várias linhas e a altura
 * acompanha o conteúdo — no celular uma tarefa longa precisa ser legível
 * inteira, não cortada na borda do cartão.
 *
 * Enter confirma (dispara o blur) em vez de inserir quebra de linha.
 */
export function InlineTextarea({
  className,
  onInput,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(fit, [fit, rest.defaultValue, rest.value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      onInput={(e) => {
        fit();
        onInput?.(e);
      }}
      className={cn(INLINE, "resize-none overflow-hidden leading-snug", className)}
      {...rest}
    />
  );
}
