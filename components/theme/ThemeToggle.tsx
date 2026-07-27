"use client";

import { useEffect } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { Moon, Sun } from "@/components/ui/Icons";
import { applyTheme, chooseTheme, currentTheme, savedTheme } from "./store";

/**
 * Alterna claro/escuro. O estado mora no atributo data-theme do <html> e não
 * em estado do React: os dois ícones vão no HTML e o CSS escolhe qual mostrar,
 * então não há divergência entre servidor e navegador.
 *
 * O tema do sistema é ignorado de propósito: sem escolha salva, é claro.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  useEffect(() => {
    // Acerta a cor da barra do navegador, que o <meta> do servidor deixou no
    // claro — o resto da página o ThemeScript já pintou.
    applyTheme(savedTheme() ?? "light");
  }, []);

  return (
    <IconButton
      label="Alternar entre tema claro e escuro"
      title="Alternar tema"
      onClick={() => chooseTheme(currentTheme() === "dark" ? "light" : "dark")}
      className={className}
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </IconButton>
  );
}
