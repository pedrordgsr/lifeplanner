/** As 5 carinhas da Avaliação do dia (1 = péssimo, 5 = ótimo). */
export const RATING_LABELS = ["Péssimo", "Ruim", "Neutro", "Bom", "Ótimo"];

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
};

export default function Face({ level }: { level: number }) {
  const eyes =
    level === 1 ? (
      // sobrancelhas caídas
      <>
        <path d="M12 13.5q4 3.5 8 0" {...STROKE} />
        <path d="M20 13.5q4 3.5 8 0" {...STROKE} />
      </>
    ) : level === 5 ? (
      // olhos fechados de sorriso
      <>
        <path d="M12.5 15.5q3.5 -4 7 0" {...STROKE} />
        <path d="M20.5 15.5q3.5 -4 7 0" {...STROKE} />
      </>
    ) : (
      <>
        <circle cx={15} cy={15.5} r={1.6} fill="currentColor" />
        <circle cx={25} cy={15.5} r={1.6} fill="currentColor" />
      </>
    );

  const mouth = {
    1: <path d="M13.5 28.5q6.5 -7.5 13 0" {...STROKE} />,
    2: <path d="M13.5 27.5q6.5 -4.5 13 0" {...STROKE} />,
    3: <path d="M14 25.5h12" {...STROKE} />,
    4: <path d="M13.5 23.5q6.5 5 13 0" {...STROKE} />,
    5: <path d="M12.5 22.5q7.5 8.5 15 0z" {...STROKE} />,
  }[level as 1 | 2 | 3 | 4 | 5];

  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
      <circle cx={20} cy={20} r={16.5} {...STROKE} strokeWidth={1.7} />
      {eyes}
      {mouth}
    </svg>
  );
}
