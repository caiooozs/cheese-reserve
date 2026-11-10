"use client";

import { useEffect, useRef } from "react";
import { formatarReais } from "@/lib/formatacao";

const DURACAO = 500;
// Mesma curva da barra do placar: cubic-bezier(0.16, 1, 0.3, 1), aproximada.
const suavizar = (t: number) => 1 - Math.pow(1 - t, 4);

// Quando o valor muda, os reais contam do antigo até o novo. Mexe só no texto
// já renderizado (nodeValue), então o React continua dono do conteúdo.
export function ValorAnimado({
  centavos,
  className,
}: {
  centavos: number;
  className?: string;
}) {
  const elemento = useRef<HTMLSpanElement>(null);
  const anterior = useRef(centavos);

  useEffect(() => {
    const de = anterior.current;
    anterior.current = centavos;
    const texto = elemento.current?.firstChild;
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!texto || de === centavos || parado) return;

    const final = formatarReais(centavos);
    const inicio = performance.now();
    let quadro = requestAnimationFrame(function passo(agora) {
      const t = Math.min(1, (agora - inicio) / DURACAO);
      texto.nodeValue = formatarReais(Math.round(de + (centavos - de) * suavizar(t)));
      if (t < 1) quadro = requestAnimationFrame(passo);
    });
    // Se o navegador pausar os quadros (aba em segundo plano), o valor certo chega mesmo assim.
    const garantia = window.setTimeout(() => {
      cancelAnimationFrame(quadro);
      texto.nodeValue = final;
    }, DURACAO + 100);

    return () => {
      cancelAnimationFrame(quadro);
      window.clearTimeout(garantia);
      texto.nodeValue = final;
    };
  }, [centavos]);

  return (
    <span ref={elemento} className={className}>
      {formatarReais(centavos)}
    </span>
  );
}
