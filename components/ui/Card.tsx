import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** `soft` tem fundo levemente esverdeado; `plain` é branco puro. */
  tone?: "plain" | "soft";
  as?: "div" | "section" | "article";
};

/** Superfície padrão do Lume: cantos generosos, traço fino, sombra baixa. */
export default function Card({
  children,
  className,
  tone = "plain",
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-[1.75rem] border border-line shadow-soft",
        tone === "soft" ? "bg-surface-soft" : "bg-surface",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
