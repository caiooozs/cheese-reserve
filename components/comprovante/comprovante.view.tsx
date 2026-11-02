"use client";

import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Carimbo } from "@/components/carimbo/carimbo.view";
import { Cartao } from "@/components/cartao/cartao.view";
import type { ComprovanteViewProps } from "@/components/comprovante/comprovante.model";
import { Selo } from "@/components/selo/selo.view";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Linha({
  rotulo,
  empilhar,
  children,
}: {
  rotulo: string;
  empilhar?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={empilhar ? "flex flex-col" : "flex justify-between gap-4"}>
      <dt className="shrink-0 text-muted-foreground">{rotulo}</dt>
      <dd
        className={cn(
          "min-w-0 font-medium wrap-anywhere tabular-nums",
          !empilhar && "text-right",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

// Cobre a página inteira para o print pegar só o comprovante.
export function ComprovanteView({ dados, acoes }: ComprovanteViewProps) {
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titulo.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="titulo-comprovante"
      className="fixed inset-0 z-40 overflow-y-auto bg-primary text-primary-foreground duration-300 ease-out animate-in fade-in motion-reduce:animate-none"
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-3 p-3">
        <Cartao>
          <div className="relative px-4 pt-4 pb-4">
            <Selo valor={dados.total} rotulo="total" className="absolute top-3 right-3" />
            <Carimbo
              arco={dados.saudacao}
              linhas={[dados.carimbo.data, dados.carimbo.hora]}
              className="absolute top-16 right-[3.25rem] size-[5.5rem] animate-carimbar"
            />
            <h2
              id="titulo-comprovante"
              ref={titulo}
              tabIndex={-1}
              className="max-w-40 text-2xl leading-tight font-bold tracking-tight outline-none"
            >
              Reserva confirmada
            </h2>
            <p className="mt-8 text-sm text-muted-foreground">Código da reserva</p>
            <p className="font-mono text-4xl font-semibold tracking-[0.12em]">
              {dados.codigo}
            </p>
          </div>
          <dl className="flex flex-col gap-2 border-t-2 border-dashed border-input px-4 pt-3 text-base">
            <Linha rotulo="Nome">{dados.nome}</Linha>
            <Linha rotulo="Quantidade">{dados.quantidade}</Linha>
            <Linha rotulo="Entrega" empilhar={dados.entregaLonga}>
              {dados.entrega}
            </Linha>
            <Linha rotulo="Feita em">{dados.feitaEm}</Linha>
          </dl>
          <p className="px-4 pb-2 text-right font-saudacao text-3xl leading-tight text-selo">
            {dados.saudacao}
          </p>
        </Cartao>

        <div className="flex gap-3">
          {dados.podeCompartilhar && (
            <Button
              onClick={acoes.compartilhar}
              className="h-12 flex-1 border-0 bg-card bg-clip-border text-base text-primary hover:bg-card/90"
            >
              <Share2Icon aria-hidden />
              Compartilhar
            </Button>
          )}
          <Button
            variant="outline"
            onClick={acoes.copiar}
            className={
              dados.podeCompartilhar
                ? "h-12 flex-1 border-primary-foreground/70 bg-transparent text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                : "h-12 flex-1 border-0 bg-card bg-clip-border text-base text-primary hover:bg-card/90 hover:text-primary"
            }
          >
            {dados.copiado ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
            {dados.copiado ? "Copiado!" : "Copiar"}
          </Button>
          <span role="status" className="sr-only">
            {dados.copiado ? "Comprovante copiado." : ""}
          </span>
        </div>

        <p className="px-1 text-base leading-snug text-pretty">
          Envie este comprovante para a vendedora pelo WhatsApp. Ela vai responder com os
          dados para pagamento.
        </p>

        <Button
          variant="ghost"
          onClick={acoes.novaReserva}
          className="h-11 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          Fazer outra reserva
        </Button>
      </div>
    </section>
  );
}
