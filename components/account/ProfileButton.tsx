"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { User } from "@/components/ui/Icons";
import ProfileSheet from "./ProfileSheet";

/**
 * Abre os ajustes da conta. A folha só é montada depois do toque — assim ela
 * nunca renderiza no servidor e pode ler o tema direto do DOM.
 *
 * Vai para o <body> por portal: tanto a pílula do rodapé quanto o cabeçalho do
 * desktop usam backdrop-blur, que cria um bloco de contenção e prenderia a
 * folha `fixed` dentro do próprio botão.
 */
export default function ProfileButton({
  username,
  className,
  iconClassName,
}: {
  username: string;
  className?: string;
  iconClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir perfil e ajustes da conta"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={className}
      >
        <User className={iconClassName} />
      </button>

      {open &&
        createPortal(
          <ProfileSheet username={username} onClose={() => setOpen(false)} />,
          document.body,
        )}
    </>
  );
}
