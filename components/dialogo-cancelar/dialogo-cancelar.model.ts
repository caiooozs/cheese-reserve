import { formatarPecas, formatarReais } from "@/lib/formatacao";
import type { ReservaPainelDTO } from "@/lib/tipos";

// Texto da confirmação (FR-031 e FR-032).
export function textosDoCancelamento(reserva: ReservaPainelDTO, pago: boolean) {
  return {
    pergunta: `Cancelar a reserva ${reserva.codigo} de ${reserva.nome} (${formatarPecas(reserva.quantidade)})?`,
    consequencia: "As peças voltam para o estoque. Isso não pode ser desfeito.",
    devolucao: pago
      ? `Esta reserva já foi paga. Devolva ${formatarReais(reserva.valorTotalCentavos)} para ${reserva.nome}.`
      : null,
  };
}

export type DialogoCancelarViewProps = {
  dados: ReturnType<typeof textosDoCancelamento> & {
    aberto: boolean;
    cancelando: boolean;
  };
  acoes: {
    mudarAberto: (aberto: boolean) => void;
    terminarTransicao: (aberto: boolean) => void;
    confirmar: () => void;
  };
};
