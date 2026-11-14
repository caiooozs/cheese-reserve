"use client";

import { CheckIcon, CircleCheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import type { ComprovanteViewProps } from "@/components/comprovante/comprovante.model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Linha({
  rotulo,
  empilhar,
  destaque,
  children,
}: {
  rotulo: string;
  empilhar?: boolean;
  destaque?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "py-2",
        empilhar ? "flex flex-col gap-0.5" : "flex items-baseline justify-between gap-4",
      )}
    >
      <dt className="shrink-0 text-muted-foreground">{rotulo}</dt>
      <dd
        className={cn(
          "min-w-0 wrap-anywhere tabular-nums",
          !empilhar && "text-right",
          destaque ? "text-lg font-semibold" : "font-medium",
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
      className="fixed inset-0 z-40 overflow-y-auto bg-background duration-200 ease-out animate-in fade-in motion-reduce:animate-none"
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sucesso-fundo text-sucesso">
            <CircleCheckIcon aria-hidden className="size-6" />
          </span>
          <h2
            id="titulo-comprovante"
            ref={titulo}
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight outline-none"
          >
            Reserva confirmada
          </h2>
        </div>

        <div className="rounded-xl border bg-card px-4 pt-3 pb-1 shadow-xs">
          <p className="text-sm text-muted-foreground">Código da reserva</p>
          <p className="mt-0.5 font-mono text-4xl font-semibold tracking-[0.14em]">
            {dados.codigo}
          </p>
          <dl className="mt-2 divide-y border-t text-base">
            <Linha rotulo="Nome">{dados.nome}</Linha>
            <Linha rotulo="Quantidade">{dados.quantidade}</Linha>
            <Linha rotulo="Total" destaque>
              {dados.total}
            </Linha>
            <Linha rotulo="Entrega" empilhar={dados.entregaLonga}>
              {dados.entrega}
            </Linha>
            <Linha rotulo="Feita em">{dados.feitaEm}</Linha>
            {/* Chave Pix da vendedora (provisória: lib/pagamento.ts). */}
            <div className="flex items-center justify-between gap-3 py-0.5">
              <dt className="shrink-0 text-muted-foreground">Pix ({dados.pix.tipo})</dt>
              <dd className="flex min-w-0 items-center gap-1">
                <span className="font-semibold tabular-nums">{dados.pix.chave}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copiar chave Pix"
                  onClick={acoes.copiarPix}
                  className="-mr-2.5 size-11 text-muted-foreground hover:text-foreground"
                >
                  {dados.pixCopiado ? (
                    <CheckIcon aria-hidden className="size-5" />
                  ) : (
                    <CopyIcon aria-hidden className="size-5" />
                  )}
                </Button>
                <span role="status" className="sr-only">
                  {dados.pixCopiado ? "Chave Pix copiada." : ""}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {dados.podeCompartilhar && (
            <Button onClick={acoes.compartilhar} className="h-12 text-base">
              <Share2Icon aria-hidden className="size-5" />
              Compartilhar
            </Button>
          )}
          <Button
            variant={dados.podeCompartilhar ? "outline" : "default"}
            onClick={acoes.copiar}
            className={cn("h-12 text-base", !dados.podeCompartilhar && "col-span-2")}
          >
            {dados.copiado ? (
              <CheckIcon aria-hidden className="size-5" />
            ) : (
              <CopyIcon aria-hidden className="size-5" />
            )}
            {dados.copiado ? "Copiado!" : "Copiar"}
          </Button>
          <span role="status" className="sr-only">
            {dados.copiado ? "Comprovante copiado." : ""}
          </span>
        </div>

        <p className="text-base leading-snug text-pretty text-muted-foreground">
          Faça o Pix e envie este comprovante para a vendedora pelo WhatsApp.
        </p>

        <Button
          variant="link"
          onClick={acoes.novaReserva}
          className="h-11 text-base text-foreground underline underline-offset-4"
        >
          Fazer outra reserva
        </Button>
      </div>
    </section>
  );
}
