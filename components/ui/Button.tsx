import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Variant = "primary" | "soft" | "ghost" | "outline";
export type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-on shadow-soft hover:bg-accent-hover active:bg-accent-hover",
  soft: "bg-accent-soft text-accent-ink hover:bg-accent-soft-hover",
  ghost: "text-muted hover:bg-accent-soft/70 hover:text-accent-ink",
  outline:
    "border border-line text-ink-soft bg-surface hover:border-line-strong hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3.5 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-[0.9375rem]",
};

/** Aparência do botão isolada, para que links (ButtonLink) usem a mesma. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium",
    "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...rest}
    >
      {children}
    </button>
  );
}
