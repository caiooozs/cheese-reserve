import { TriangleAlertIcon } from "lucide-react";
import type { DialogoCancelarViewProps } from "@/components/dialogo-cancelar/dialogo-cancelar.model";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  DIALOGO,
  DIALOGO_BOTAO,
  DIALOGO_RODAPE,
  DIALOGO_TEXTO,
  DIALOGO_TITULO,
} from "@/lib/estilos";
import { cn } from "@/lib/utils";

export function DialogoCancelarView({ dados, acoes }: DialogoCancelarViewProps) {
  return (
    <AlertDialog
      open={dados.aberto}
      onOpenChange={acoes.mudarAberto}
      onOpenChangeComplete={acoes.terminarTransicao}
    >
      {/* Texto sempre à esquerda, como nos outros diálogos do painel. */}
      <AlertDialogContent className={cn(DIALOGO, "data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-md")}>
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className={DIALOGO_TITULO}>{dados.pergunta}</AlertDialogTitle>
          <AlertDialogDescription className={DIALOGO_TEXTO}>
            {dados.consequencia}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {dados.devolucao && (
          <p
            role="note"
            className="flex gap-3 rounded-lg border border-aviso/30 bg-aviso-fundo p-3 text-base leading-snug"
          >
            <TriangleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-aviso" />
            {dados.devolucao}
          </p>
        )}

        <AlertDialogFooter className={DIALOGO_RODAPE}>
          <AlertDialogCancel disabled={dados.cancelando} className={DIALOGO_BOTAO}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={dados.cancelando}
            onClick={acoes.confirmar}
            className={DIALOGO_BOTAO}
          >
            {dados.cancelando && <Spinner aria-hidden className="size-5" />}
            {dados.cancelando ? "Cancelando…" : "Cancelar reserva"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
