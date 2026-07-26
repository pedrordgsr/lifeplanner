import type { ReactNode } from "react";
import Link from "next/link";
import { buttonStyles, type Size, type Variant } from "./Button";

/** Link com a aparência de botão — mesmo vocabulário visual do Button. */
export default function ButtonLink({
  href,
  children,
  variant,
  size,
  fullWidth,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={buttonStyles({ variant, size, fullWidth, className })}
    >
      {children}
    </Link>
  );
}
