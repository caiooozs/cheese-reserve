import {
  ChevronDownIcon,
  CircleXIcon,
  MessageCircleIcon,
  PencilLineIcon,
  UserPenIcon,
} from "lucide-react";
import type { LinhaReservaViewProps } from "@/components/linha-reserva/linha-reserva.model";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { COLUNAS_RESERVA } from "@/lib/estilos";
import { cn } from "@/lib/utils";

// No celular o rótulo diz o que o interruptor controla. No desktop, onde o
// cabeçalho da coluna já diz isso, o texto visível mostra a situação.
function Interruptor({
  rotulo,
  situacao,
  marcado,
  aoMudar,
}: {
  rotulo: string;
  situacao: string;
  marcado: boolean;
  aoMudar: (marcado: boolean) => void;
}) {
  return (
    <label className="flex h-12 min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-base font-medium select-none md:h-11 md:flex-none md:justify-start md:gap-3">
      <span className="truncate md:sr-only">{rotulo}</span>
      <Switch checked={marcado} onCheckedChange={aoMudar} />
      <span
        aria-hidden
        className={cn("hidden md:inline", !marcado && "font-normal text-muted-foreground")}
      >
        {situacao}
      </span>
    </label>
  );
}

// Ações dentro dos detalhes: 44 px, como o atalho do WhatsApp.
const ACAO = "h-11 shrink-0 px-4 text-base";

// No celular: nome e total, depois código e horário, depois os interruptores.
// No desktop: uma linha só, nas colunas do cabeçalho da lista.
const GRADE =
  "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-4 py-3.5 [grid-template-areas:'nome_total'_'meta_mais'_'status_status'] md:gap-x-4 md:items-center md:gap-y-0.5 md:py-3 md:[grid-template-areas:'nome_total_pago_entregue_mais'_'meta_total_pago_entregue_mais']";

export function LinhaReservaView({ dados, acoes }: LinhaReservaViewProps) {
  return (
    <Collapsible
      open={dados.aberta}
      onOpenChange={acoes.alternarDetalhes}
      className={cn(GRADE, COLUNAS_RESERVA, dados.cancelada && "text-muted-foreground")}
    >
      <p className="min-w-0 text-base leading-snug font-semibold text-pretty wrap-anywhere [grid-area:nome]">
        {dados.nome}
      </p>
      <p className="text-right text-base font-semibold tabular-nums [grid-area:total]">
        {dados.total}
      </p>
      <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground tabular-nums [grid-area:meta]">
        <span className="font-mono font-medium tracking-[0.08em] text-foreground">
          {dados.codigo}
        </span>
        <span>{dados.resumo}</span>
      </p>

      <div className="mt-2 grid grid-cols-2 divide-x border-t [grid-area:status] md:contents md:divide-x-0">
        {dados.cancelada ? (
          <p className="col-span-2 flex h-12 items-center gap-2 text-sm md:col-[3/5] md:row-[1/3] md:h-auto">
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-foreground">
              Cancelada
            </span>
            Fora dos totais
          </p>
        ) : (
          <>
            <div className="flex pr-3 md:pr-0 md:[grid-area:pago]">
              <Interruptor
                rotulo="Pago"
                situacao={dados.pago ? "Pago" : "Pendente"}
                marcado={dados.pago}
                aoMudar={acoes.marcarPago}
              />
            </div>
            <div className="flex pl-3 md:pl-0 md:[grid-area:entregue]">
              <Interruptor
                rotulo="Entregue"
                situacao={dados.entregue ? "Entregue" : "A entregar"}
                marcado={dados.entregue}
                aoMudar={acoes.marcarEntregue}
              />
            </div>
          </>
        )}
      </div>

      <CollapsibleTrigger
        aria-label={dados.aberta ? "Esconder detalhes" : "Ver detalhes"}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "-my-2 size-11 shrink-0 justify-self-end text-muted-foreground [grid-area:mais] md:my-0",
        )}
      >
        <ChevronDownIcon
          aria-hidden
          className={cn("size-5 transition-transform duration-200 motion-reduce:transition-none", dados.aberta && "rotate-180")}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="col-span-full h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
        <div className="mt-1 flex flex-col gap-4 border-t pt-3 pb-1 text-foreground md:mt-3">
          <dl className="grid gap-3 text-base sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">WhatsApp</dt>
              <dd className="tabular-nums">{dados.whatsapp}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Entrega</dt>
              <dd className="leading-snug wrap-anywhere">{dados.entrega}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Feita em</dt>
              <dd className="tabular-nums">{dados.feitaEm}</dd>
            </div>
          </dl>

          {/* No celular, uma ação por linha; no desktop, lado a lado e Cancelar no fim. */}
          <div className="grid gap-2 md:flex md:flex-wrap md:items-center">
            <a
              href={dados.linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), ACAO, "shadow-xs")}
            >
              <MessageCircleIcon aria-hidden className="size-5" />
              Abrir conversa no WhatsApp
            </a>
            {!dados.cancelada && (
              <>
                <Button
                  variant="outline"
                  disabled={dados.pago}
                  focusableWhenDisabled
                  aria-describedby={dados.pago ? `${dados.idDetalhes}-pago` : undefined}
                  onClick={() => acoes.abrirDialogo("quantidade")}
                  className={cn(ACAO, "shadow-xs")}
                >
                  <PencilLineIcon aria-hidden className="size-5" />
                  Alterar quantidade
                </Button>
                {/* O motivo fica logo abaixo do botão que ele explica; no desktop, numa linha própria no fim. */}
                {dados.pago && (
                  <p
                    id={`${dados.idDetalhes}-pago`}
                    className="-mt-1 mb-1 text-sm text-pretty text-muted-foreground md:order-last md:my-0 md:basis-full"
                  >
                    {dados.avisoPago}
                  </p>
                )}
                <Button
                  variant="outline"
                  onClick={() => acoes.abrirDialogo("dados")}
                  className={cn(ACAO, "shadow-xs")}
                >
                  <UserPenIcon aria-hidden className="size-5" />
                  Corrigir dados
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => acoes.abrirDialogo("cancelar")}
                  className={cn(
                    ACAO,
                    "text-destructive hover:bg-destructive/10 hover:text-destructive md:ml-auto dark:hover:bg-destructive/15",
                  )}
                >
                  <CircleXIcon aria-hidden className="size-5" />
                  Cancelar reserva
                </Button>
              </>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
