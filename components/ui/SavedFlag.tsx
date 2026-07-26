import { cn } from "@/lib/cn";

/** Confirmação silenciosa de gravação — aparece e some sozinha. */
export default function SavedFlag({ show }: { show: boolean }) {
  return (
    <span
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1",
        "text-[0.6875rem] font-medium text-accent-ink transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      {show ? "salvo" : ""}
    </span>
  );
}
