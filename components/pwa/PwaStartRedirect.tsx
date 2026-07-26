"use client";

import { useEffect } from "react";

/**
 * Corrige instalações antigas que ainda guardaram `/` como endereço inicial.
 * No navegador comum a landing continua pública; somente a janela standalone
 * segue diretamente para o planner.
 */
export default function PwaStartRedirect() {
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone && window.location.pathname === "/") {
      window.location.replace("/mes");
    }
  }, []);

  return null;
}
