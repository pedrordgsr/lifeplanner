"use client";

import { THEME_KEY, THEME_META_COLOR } from "./ThemeScript";

export type Theme = "light" | "dark";

/**
 * O estado do tema mora no atributo data-theme do <html> — o mesmo que o
 * ThemeScript escreve antes da hidratação. Ler de lá (e não de estado do
 * React) mantém todos os controles de tema em acordo entre si.
 */
export function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

/** localStorage pode lançar (navegação privada, cookies bloqueados). */
export function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

/** Pinta a interface e a barra do navegador, sem persistir nada. */
export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_META_COLOR[theme]);
}

/** Escolha explícita do usuário: aplica e guarda para as próximas visitas. */
export function chooseTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* sem persistência: o tema vale só para esta aba */
  }
}
