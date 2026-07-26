"use client";

import { cn } from "@/lib/cn";
import { Check } from "./Icons";

/** Caixa de marcação arredondada, com o verde da marca quando concluída. */
export default function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        // Um pouco maior no celular, onde o alvo é o dedo.
        "grid h-6 w-6 shrink-0 place-items-center rounded-[0.5rem] border transition-all duration-200 sm:h-5 sm:w-5",
        checked
          ? "border-accent bg-accent text-accent-on"
          : "border-line-strong bg-surface text-transparent hover:border-accent hover:bg-accent-soft",
        className,
      )}
    >
      <Check />
    </button>
  );
}
