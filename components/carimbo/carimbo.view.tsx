import { useId } from "react";
import { cn } from "@/lib/utils";

export function Carimbo({
  arco,
  linhas,
  className,
}: {
  arco: string;
  linhas: string[];
  className?: string;
}) {
  const idArco = useId();
  const tamanho = Math.max(...linhas.map((l) => l.length)) > 8 ? 9.8 : 13;
  const inicio = 56 - ((linhas.length - 1) * (tamanho + 2)) / 2;

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={cn(
        "size-24 -rotate-12 fill-current stroke-current font-bold text-primary uppercase opacity-85 mix-blend-multiply",
        className,
      )}
    >
      <defs>
        <path id={idArco} d="M 11 50 A 39 39 0 0 1 89 50" fill="none" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="35" fill="none" strokeWidth="1" />
      <text stroke="none" fontSize="9" letterSpacing="1.4" textAnchor="middle">
        <textPath href={`#${idArco}`} startOffset="50%">
          {arco}
        </textPath>
      </text>
      {linhas.map((linha, i) => (
        <text
          key={linha}
          x="50"
          y={inicio + i * (tamanho + 2)}
          stroke="none"
          fontSize={tamanho}
          textAnchor="middle"
        >
          {linha}
        </text>
      ))}
    </svg>
  );
}
