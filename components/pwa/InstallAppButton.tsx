"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Download } from "@/components/ui/Icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Help = "ios" | "browser" | null;

function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * O Chrome entrega o evento de instalação sob demanda. Já o Safari no iOS não
 * o implementa, por isso o mesmo botão explica o caminho nativo de instalação.
 */
export default function InstallAppButton({
  className,
}: {
  className?: string;
}) {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState<Help>(null);

  useEffect(() => {
    // Espera a primeira pintura para manter a hidratação igual ao HTML do
    // servidor e então consultar as APIs exclusivas do navegador.
    const frame = window.requestAnimationFrame(() => {
      setInstalled(isInstalled());
      setReady(true);
    });

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
    }

    function handleInstalled() {
      deferredPrompt.current = null;
      setInstalled(true);
      setHelp(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function install() {
    const prompt = deferredPrompt.current;

    if (prompt) {
      setHelp(null);
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      deferredPrompt.current = null;
      return;
    }

    setHelp(isIOS() ? "ios" : "browser");
  }

  // Some por completo quando não há o que instalar — quem chama pode
  // envolvê-lo em separadores sem medo de deixar uma moldura vazia.
  if (!ready || installed) return null;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={install}
        aria-expanded={help !== null}
        aria-controls="install-app-help"
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-accent px-3 text-xs font-medium text-accent-on shadow-soft transition-colors duration-200 hover:bg-accent-hover"
      >
        <Download className="h-4 w-4" />
        <span>Instalar</span>
      </button>

      {help && (
        <div
          id="install-app-help"
          role="status"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-64 rounded-2xl border border-line bg-surface p-3 text-xs leading-relaxed text-ink-soft shadow-lg"
        >
          {help === "ios"
            ? "No Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início”."
            : "Use o menu do navegador e selecione “Instalar app” ou “Adicionar à tela inicial”."}
        </div>
      )}
    </div>
  );
}
