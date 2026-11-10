import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  textosDoCancelamento,
  type DialogoCancelarViewProps,
} from "@/components/dialogo-cancelar/dialogo-cancelar.model";
import type { ControleDialogo } from "@/components/linha-reserva/linha-reserva.model";
import { toast } from "@/components/ui/toast";
import { MENSAGEM_GENERICA, traduzirErro } from "@/lib/erros";
import type { ReservaPainelDTO } from "@/lib/tipos";
import { cancelarReserva } from "@/service/reservas/reservas.actions";

export function useDialogoCancelarViewModel(
  reserva: ReservaPainelDTO,
  pago: boolean,
  controle: ControleDialogo,
): DialogoCancelarViewProps {
  const router = useRouter();
  const [cancelando, iniciar] = useTransition();

  return {
    dados: {
      ...textosDoCancelamento(reserva, pago),
      aberto: controle.aberto,
      cancelando,
    },
    acoes: {
      mudarAberto(aberto) {
        // Enquanto cancela, a janela fica: o resultado precisa aparecer.
        if (!cancelando) controle.aoMudarAberto(aberto);
      },
      terminarTransicao(aberto) {
        if (!aberto) controle.aoTerminar();
      },
      confirmar() {
        iniciar(async () => {
          let resultado;
          try {
            resultado = await cancelarReserva({ id: reserva.id });
          } catch {
            toast.add({ title: MENSAGEM_GENERICA, type: "error" });
            return;
          }

          if (resultado.ok) {
            toast.add({
              title: `Reserva ${reserva.codigo} cancelada.`,
              // A lista mostra as ativas: a cancelada sai da vista, mas não some.
              description:
                "As peças voltaram para o estoque. Para vê-la, filtre Situação: Canceladas.",
              type: "success",
            });
          } else {
            toast.add({ title: traduzirErro(resultado.erro), type: "error" });
            router.refresh();
          }
          controle.aoMudarAberto(false);
        });
      },
    },
  };
}
