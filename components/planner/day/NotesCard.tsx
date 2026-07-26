"use client";

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import SavedFlag from "@/components/ui/SavedFlag";

/** Bloco de texto livre com aviso discreto de "salvo". */
export default function NotesCard({
  title,
  value,
  placeholder,
  saved,
  rows,
  className,
  onChange,
  onFlush,
}: {
  title: string;
  value: string;
  placeholder: string;
  saved: boolean;
  rows?: number;
  className?: string;
  onChange: (value: string) => void;
  onFlush: () => void;
}) {
  return (
    <Card as="section" className={className}>
      <div className="flex h-full flex-col p-5 sm:p-6">
        <SectionTitle title={title} aside={<SavedFlag show={saved} />} />
        <textarea
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onFlush}
          placeholder={placeholder}
          // `w-full` anula a largura intrínseca do textarea (atributo cols).
          className="mt-4 min-h-28 w-full flex-1 resize-none rounded-xl bg-transparent p-1.5 text-[0.9375rem] leading-relaxed outline-none transition-colors duration-200 placeholder:text-faint hover:bg-surface-soft focus:bg-surface-soft"
        />
      </div>
    </Card>
  );
}
