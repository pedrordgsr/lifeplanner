"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Moon, Sun } from "@/components/ui/Icons";
import { chooseTheme, currentTheme, type Theme } from "./store";

const OPTIONS = [
  { value: "light" as const, label: "Claro", Icon: Sun },
  { value: "dark" as const, label: "Escuro", Icon: Moon },
];

/**
 * Seletor de tema em duas pastilhas. Diferente do ThemeToggle, aqui o estado
 * precisa existir no React para marcar qual opção está ativa — o que só é
 * seguro porque este controle vive dentro da folha de perfil, montada apenas
 * depois de um toque, ou seja, nunca renderizada no servidor.
 */
export default function ThemeChoice() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  return (
    <div
      role="radiogroup"
      aria-label="Tema da interface"
      className="flex items-center gap-1 rounded-full border border-line bg-surface-soft p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              chooseTheme(value);
              setTheme(value);
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[13px]",
              "transition-colors duration-200",
              active
                ? "bg-surface font-medium text-accent-ink shadow-soft"
                : "text-muted hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
