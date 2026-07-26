"use client";

import { useEffect } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { Moon, Sun } from "@/components/ui/Icons";
import { THEME_KEY, THEME_META_COLOR } from "./ThemeScript";

type Theme = "light" | "dark";

/** localStorage pode lançar (navegação privada, cookies bloqueados). */
function readChoice(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* sem persistência: o tema vale só para esta aba */
  }
}

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_META_COLOR[theme]);
}

/**
 * Alterna claro/escuro. O estado mora no atributo data-theme do <html> — o
 * mesmo que o ThemeScript já escreveu antes da hidratação — e não em estado
 * do React: os dois ícones vão no HTML e o CSS escolhe qual mostrar, então
 * não há divergência entre servidor e navegador.
 *
 * O tema do sistema é ignorado de propósito: sem escolha salva, é claro.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  useEffect(() => {
    // Acerta a cor da barra do navegador, que o <meta> do servidor deixou no
    // claro — o resto da página o ThemeScript já pintou.
    apply(readChoice() ?? "light");
  }, []);

  const toggle = () => {
    const next: Theme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    apply(next);
    saveChoice(next);
  };

  return (
    <IconButton
      label="Alternar entre tema claro e escuro"
      title="Alternar tema"
      onClick={toggle}
      className={className}
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </IconButton>
  );
}
