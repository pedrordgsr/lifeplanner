import Card from "@/components/ui/Card";
import { Check } from "@/components/ui/Icons";
import { HABIT_COLORS } from "@/lib/theme";
import PreviewWheel, {
  PREVIEW_COUNTS,
  PREVIEW_DAYS,
} from "./PreviewWheel";

const HABITS = ["Beber água", "Ler 20 páginas", "Caminhar", "Dormir cedo"];

/**
 * Retrato estático do Mapa do Mês — só ilustração da landing, sem dados reais.
 * Fica marcado como decorativo para leitores de tela; o texto ao lado é que
 * conta a história.
 */
export default function PlannerPreview() {
  return (
    <div className="relative" aria-hidden>
      <Card className="p-6 shadow-float sm:p-7">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="label-eyebrow">Mapa do mês</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-ink">
              Julho
            </p>
          </div>
          <p className="text-xs text-muted">
            {PREVIEW_DAYS} dias · 7 hábitos
          </p>
        </div>

        <PreviewWheel className="mx-auto mt-4 block w-full max-w-[19rem]" />

        <ul className="mt-4 space-y-2.5 border-t border-line pt-4">
          {HABITS.map((habit, i) => (
            <li key={habit} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: HABIT_COLORS[i] }}
              />
              <span className="truncate text-ink-soft">{habit}</span>
              <span className="ml-auto shrink-0 text-xs tabular-nums text-muted">
                {PREVIEW_COUNTS[i]}/{PREVIEW_DAYS}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Cartão do dia encostado no canto do primeiro — dá profundidade e
          mostra a segunda página. Some no celular, onde não sobra largura
          para a sobreposição. */}
      <Card className="relative z-10 -mt-7 -ml-10 hidden w-[14.5rem] p-4 shadow-float lg:block">
        <p className="label-eyebrow">Hoje</p>
        <ul className="mt-3 space-y-2.5">
          {["Escrever 3 páginas", "Alongar 10 min", "Ligar para a vó"].map(
            (task, i) => (
              <li key={task} className="flex items-center gap-2.5 text-sm">
                <span
                  className={
                    i < 2
                      ? "grid h-4 w-4 place-items-center rounded-md bg-accent text-accent-on"
                      : "h-4 w-4 rounded-md border border-line-strong"
                  }
                >
                  {i < 2 && <Check />}
                </span>
                <span
                  className={
                    i < 2 ? "text-muted line-through" : "text-ink-soft"
                  }
                >
                  {task}
                </span>
              </li>
            ),
          )}
        </ul>
      </Card>
    </div>
  );
}
