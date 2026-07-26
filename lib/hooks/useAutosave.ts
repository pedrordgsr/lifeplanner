"use client";

import { useEffect, useRef, useState, useTransition } from "react";

/**
 * Guarda um texto sozinho 800ms depois da última tecla e acende o aviso de
 * "salvo" por um instante. Devolve também `flush()` para gravar na hora
 * (usado no blur, quando a pessoa sai do campo antes do tempo).
 */
export function useAutosave(
  initial: string,
  save: (value: string) => Promise<void>,
  delay = 800,
) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();
  const lastSaved = useRef(initial);

  function persist(next: string) {
    lastSaved.current = next;
    startTransition(async () => {
      await save(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });
  }

  useEffect(() => {
    if (value === lastSaved.current) return;
    const timer = setTimeout(() => persist(value), delay);
    return () => clearTimeout(timer);
    // `persist` é estável o bastante: só depende de `save`, que não muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  function flush() {
    if (value !== lastSaved.current) persist(value);
  }

  return { value, setValue, saved, flush };
}
