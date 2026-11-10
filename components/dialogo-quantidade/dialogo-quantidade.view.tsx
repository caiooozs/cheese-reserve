import { MinusIcon, PlusIcon } from "lucide-react";
import type { DialogoQuantidadeViewProps } from "@/components/dialogo-quantidade/dialogo-quantidade.model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  DIALOGO,
  DIALOGO_BOTAO,
  DIALOGO_RODAPE,
  DIALOGO_TEXTO,
  DIALOGO_TITULO,
  STEPPER_CAIXA,
  STEPPER_NUMERO,
} from "@/lib/estilos";

export function DialogoQuantidadeView({ dados, campos, acoes }: DialogoQuantidadeViewProps) {
  const erro = campos.quantidade.erro;

  return (
    <Dialog
      open={dados.aberto}
      onOpenChange={acoes.mudarAberto}
      onOpenChangeComplete={acoes.terminarTransicao}
    >
      <DialogContent showCloseButton={false} className={DIALOGO}>
        <form noValidate onSubmit={acoes.salvar} className="contents">
          <DialogHeader>
            <DialogTitle className={DIALOGO_TITULO}>Alterar quantidade</DialogTitle>
            <DialogDescription className={DIALOGO_TEXTO}>{dados.descricao}</DialogDescription>
          </DialogHeader>

          <Field data-invalid={Boolean(erro)} className="gap-1.5">
            <FieldLabel htmlFor="nova-quantidade" className="text-base font-medium">
              Quantidade de peças
            </FieldLabel>
            {/* O Field estica os filhos; o invólucro deixa a caixa só do tamanho dos botões. */}
            <div>
              <div className={STEPPER_CAIXA}>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Diminuir quantidade"
                  disabled={!dados.podeDiminuir}
                  onClick={acoes.diminuir}
                  className="h-12 w-12 rounded-r-none"
                >
                  <MinusIcon aria-hidden className="size-5" />
                </Button>
                <Input
                  {...campos.quantidade.input}
                  id="nova-quantidade"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={Boolean(erro)}
                  aria-describedby="nova-quantidade-ajuda"
                  className={STEPPER_NUMERO}
                />
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Aumentar quantidade"
                  disabled={!dados.podeAumentar}
                  onClick={acoes.aumentar}
                  className="h-12 w-12 rounded-l-none"
                >
                  <PlusIcon aria-hidden className="size-5" />
                </Button>
              </div>
            </div>
            <FieldDescription id="nova-quantidade-ajuda" className="text-sm tabular-nums">
              {dados.limite}
            </FieldDescription>
            <FieldError errors={erro ? [{ message: erro }] : []} className="text-sm" />
          </Field>

          {dados.previa && (
            <div className="rounded-lg bg-muted px-4 py-3" aria-live="polite">
              <div className="flex items-end justify-between gap-4">
                <div className="flex min-w-0 flex-col">
                  <span className="text-base font-medium">{dados.previa.titulo}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {dados.previa.conta}
                  </span>
                </div>
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {dados.previa.total}
                </span>
              </div>
              <p className="mt-2 border-t pt-2 text-sm text-pretty text-muted-foreground tabular-nums">
                {dados.previa.efeito} Vale o preço da reserva: {dados.preco} por peça.
              </p>
            </div>
          )}

          <DialogFooter className={DIALOGO_RODAPE}>
            <DialogClose render={<Button type="button" variant="outline" className={DIALOGO_BOTAO} />}>
              Voltar
            </DialogClose>
            <Button
              type="submit"
              disabled={!dados.alterado || dados.salvando}
              className={DIALOGO_BOTAO}
            >
              {dados.salvando && <Spinner aria-hidden className="size-5" />}
              {dados.salvando ? "Salvando…" : "Salvar quantidade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
