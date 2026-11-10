import type { ReactNode } from "react";
import type { DialogoDadosViewProps } from "@/components/dialogo-dados-cliente/dialogo-dados-cliente.model";
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
import { Textarea } from "@/components/ui/textarea";
import {
  CAMPO,
  DIALOGO,
  DIALOGO_BOTAO,
  DIALOGO_RODAPE,
  DIALOGO_TEXTO,
  DIALOGO_TITULO,
} from "@/lib/estilos";
import { cn } from "@/lib/utils";

function Campo({
  id,
  rotulo,
  ajuda,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  ajuda?: string;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={Boolean(erro)} className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-base font-medium">
        {rotulo}
      </FieldLabel>
      {children}
      {ajuda && <FieldDescription className="text-sm">{ajuda}</FieldDescription>}
      <FieldError errors={erro ? [{ message: erro }] : []} className="text-sm" />
    </Field>
  );
}

export function DialogoDadosView({ dados, campos, acoes }: DialogoDadosViewProps) {
  return (
    <Dialog
      open={dados.aberto}
      onOpenChange={acoes.mudarAberto}
      onOpenChangeComplete={acoes.terminarTransicao}
    >
      <DialogContent showCloseButton={false} className={DIALOGO}>
        <form noValidate onSubmit={acoes.salvar} className="contents">
          <DialogHeader>
            <DialogTitle className={DIALOGO_TITULO}>Corrigir dados do cliente</DialogTitle>
            <DialogDescription className={DIALOGO_TEXTO}>{dados.descricao}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            <Campo id="corrigir-nome" rotulo="Nome" erro={campos.nome.erro}>
              <Input
                {...campos.nome.input}
                id="corrigir-nome"
                autoComplete="off"
                aria-invalid={Boolean(campos.nome.erro)}
                className={CAMPO}
              />
            </Campo>
            <Campo
              id="corrigir-whatsapp"
              rotulo="WhatsApp"
              ajuda="Com DDD. Exemplo: (11) 98765-4321"
              erro={campos.whatsapp.erro}
            >
              <Input
                {...campos.whatsapp.input}
                id="corrigir-whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                aria-invalid={Boolean(campos.whatsapp.erro)}
                className={cn(CAMPO, "tabular-nums")}
              />
            </Campo>
            <Campo
              id="corrigir-endereco"
              rotulo="Endereço de entrega (opcional)"
              ajuda="Em branco, a entrega é combinada pelo WhatsApp."
              erro={campos.endereco.erro}
            >
              <Textarea
                {...campos.endereco.input}
                id="corrigir-endereco"
                rows={2}
                autoComplete="off"
                aria-invalid={Boolean(campos.endereco.erro)}
                className={cn(CAMPO, "h-auto min-h-20 resize-none py-3")}
              />
            </Campo>
          </div>

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
              {dados.salvando ? "Salvando…" : "Salvar dados"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
