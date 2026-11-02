import { TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ValorAnimado } from "@/components/valor-animado/valor-animado.view";
import { formatarReais } from "@/lib/formatacao";
import type { ResumoPainelDTO } from "@/lib/tipos";
import { cn } from "@/lib/utils";

// Só o que foge do normal ganha aviso: preço e abertura ficam nas configurações.
function avisoDaVenda(resumo: ResumoPainelDTO) {
  if (resumo.precoCentavos === 0) {
    return "Preço ainda não definido: a página mostra que as reservas não abriram.";
  }
  if (!resumo.reservasAbertas) {
    return `Reservas encerradas. Preço: ${formatarReais(resumo.precoCentavos)} por peça.`;
  }
  return null;
}

function Card({
  rotulo,
  nota,
  className,
  children,
}: {
  rotulo: string;
  nota: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col rounded-xl border bg-card px-4 py-3.5 shadow-xs", className)}>
      <dt className="text-sm font-medium text-muted-foreground">{rotulo}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {children}
      </dd>
      <dd className="mt-auto pt-1 text-sm text-muted-foreground tabular-nums">{nota}</dd>
    </div>
  );
}

// Totais sobre todas as reservas ativas, sem olhar para os filtros (FR-025).
export function ResumoPainel({ resumo }: { resumo: ResumoPainelDTO }) {
  const aviso = avisoDaVenda(resumo);
  const fracaoReservada = resumo.total > 0 ? resumo.reservadas / resumo.total : 0;

  return (
    <section aria-labelledby="titulo-resumo" className="flex flex-col gap-3">
      <h2 id="titulo-resumo" className="sr-only">
        Como está a venda
      </h2>

      {aviso && (
        <p
          role="status"
          className="flex gap-3 rounded-lg border border-aviso/30 bg-aviso-fundo p-3 text-base leading-snug"
        >
          <TriangleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-aviso" />
          {aviso}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card rotulo="Recebido" nota="Já pago">
          <ValorAnimado centavos={resumo.recebidoCentavos} />
        </Card>
        <Card rotulo="A receber" nota="Falta pagar">
          <ValorAnimado centavos={resumo.aReceberCentavos} />
        </Card>
        <Card
          rotulo="Peças"
          className="col-span-2 md:col-span-1"
          nota={
            <>
              <span
                aria-hidden
                className="mt-1 mb-2 block h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <span
                  className="block h-full origin-left rounded-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                  style={{ transform: `scaleX(${fracaoReservada})` }}
                />
              </span>
              {resumo.disponivel === 1 ? "1 disponível" : `${resumo.disponivel} disponíveis`}
            </>
          }
        >
          {resumo.reservadas}
          <span className="text-base font-normal text-muted-foreground">
            {" "}
            de {resumo.total} reservadas
          </span>
        </Card>
      </dl>
    </section>
  );
}
