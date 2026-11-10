import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ConfiguracoesVendaViewProps } from "@/components/configuracoes-venda/configuracoes-venda.model";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { CAMPO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

// Cada ajuste é um bloco com o mesmo ritmo: rótulo, controle de 48 px e ajuda.
// No celular os blocos se empilham separados por fio; no desktop viram colunas.
const BLOCO = "max-md:py-5 max-md:first:pt-0 max-md:last:pb-0";

function Ajuste({
  id,
  rotulo,
  ajuda,
  erro,
  salvando,
  alterado,
  rotuloBotao,
  aoEnviar,
  children,
}: {
  id: string;
  rotulo: string;
  ajuda: ReactNode;
  erro?: string;
  salvando: boolean;
  alterado: boolean;
  rotuloBotao: string;
  aoEnviar: ConfiguracoesVendaViewProps["acoes"]["salvarPreco"];
  children: ReactNode;
}) {
  return (
    <form noValidate onSubmit={aoEnviar} className={BLOCO}>
      <Field data-invalid={Boolean(erro)} className="gap-1.5">
        <FieldLabel htmlFor={id} className="text-base font-medium">
          {rotulo}
        </FieldLabel>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">{children}</div>
          <Button
            type="submit"
            variant="outline"
            disabled={salvando || !alterado}
            className="h-12 shrink-0 px-4 text-base shadow-xs"
          >
            {salvando && <Spinner aria-hidden className="size-5" />}
            {salvando ? "Salvando…" : rotuloBotao}
          </Button>
        </div>
        <FieldDescription id={`${id}-ajuda`} className="text-sm tabular-nums">
          {ajuda}
        </FieldDescription>
        <FieldError id={`${id}-erro`} errors={erro ? [{ message: erro }] : []} className="text-sm" />
      </Field>
    </form>
  );
}

function descritoPor(id: string, erro?: string) {
  return erro ? `${id}-ajuda ${id}-erro` : `${id}-ajuda`;
}

// Faixa entre os números e a lista: fechada mostra o estado salvo numa frase;
// aberta, os três ajustes. Abre sozinha enquanto falta preço ou total.
export function ConfiguracoesVendaView({ dados, campos, acoes }: ConfiguracoesVendaViewProps) {
  return (
    <Collapsible
      open={dados.aberta}
      onOpenChange={acoes.alternar}
      className="rounded-xl border bg-card shadow-xs"
    >
      <h2>
        <CollapsibleTrigger className="group flex min-h-16 w-full items-center gap-3 rounded-xl px-4 py-3 text-left outline-none transition-colors duration-150 hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 data-panel-open:rounded-b-none">
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold">Configurações da venda</span>
            <span className="mt-0.5 block text-sm text-pretty text-muted-foreground tabular-nums">
              {dados.resumo}
            </span>
          </span>
          <ChevronDownIcon
            aria-hidden
            className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-180 motion-reduce:transition-none"
          />
        </CollapsibleTrigger>
      </h2>

      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
        <div className="grid border-t px-4 py-5 max-md:divide-y md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          <Ajuste
            id="config-preco"
            rotulo="Preço por peça"
            ajuda="Vale para as próximas reservas. As já feitas mantêm o preço."
            erro={campos.preco.erro}
            salvando={dados.salvandoPreco}
            alterado={dados.precoAlterado}
            rotuloBotao="Salvar preço"
            aoEnviar={acoes.salvarPreco}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-base text-muted-foreground"
            >
              R$
            </span>
            <Input
              {...campos.preco.input}
              id="config-preco"
              inputMode="decimal"
              autoComplete="off"
              enterKeyHint="done"
              aria-invalid={Boolean(campos.preco.erro)}
              aria-describedby={descritoPor("config-preco", campos.preco.erro)}
              className={cn(CAMPO, "pl-11 tabular-nums")}
            />
          </Ajuste>

          <Ajuste
            id="config-total"
            rotulo="Total de queijos"
            ajuda={
              <>
                Conte todos, inclusive os já reservados.
                <span className="block text-foreground">{dados.estoque}</span>
              </>
            }
            erro={campos.total.erro}
            salvando={dados.salvandoTotal}
            alterado={dados.totalAlterado}
            rotuloBotao="Salvar total"
            aoEnviar={acoes.salvarTotal}
          >
            <Input
              {...campos.total.input}
              id="config-total"
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="done"
              aria-invalid={Boolean(campos.total.erro)}
              aria-describedby={descritoPor("config-total", campos.total.erro)}
              className={cn(CAMPO, "tabular-nums")}
            />
          </Ajuste>

          <div className={cn(BLOCO, "flex flex-col gap-1.5")}>
            <p id="config-abertura" className="text-base font-medium">
              Receber reservas
            </p>
            {/* O nome do interruptor é sempre "Receber reservas"; o texto ao lado só mostra
                o que a página pública faz. Sem borda de campo: é uma linha, como Pago e Entregue. */}
            <label className="-mx-3 flex h-12 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 transition-colors duration-150 select-none hover:bg-muted/60">
              <span
                aria-hidden
                className={cn("truncate text-base", !dados.vendendo && "text-muted-foreground")}
              >
                {dados.estadoAbertura}
              </span>
              <Switch
                checked={dados.abertas}
                onCheckedChange={acoes.alternarAbertura}
                aria-labelledby="config-abertura"
                aria-describedby="config-abertura-ajuda"
              />
            </label>
            <p id="config-abertura-ajuda" className="text-sm text-pretty text-muted-foreground">
              {dados.ajudaAbertura}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
