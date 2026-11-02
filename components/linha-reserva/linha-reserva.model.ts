import {
  formatarDataHora,
  formatarHora,
  formatarPecas,
  formatarReais,
} from "@/lib/formatacao";
import type { ReservaPainelDTO } from "@/lib/tipos";
import { formatarWhatsapp, linkWhatsApp } from "@/lib/whatsapp";

export type StatusReserva = {
  pagamento: ReservaPainelDTO["statusPagamento"];
  entrega: ReservaPainelDTO["statusEntrega"];
};

// O que a linha mostra, já em texto. Sem regra de negócio: só formatação.
export function textosDaReserva(reserva: ReservaPainelDTO) {
  return {
    codigo: reserva.codigo,
    nome: reserva.nome,
    total: formatarReais(reserva.valorTotalCentavos),
    resumo: `${formatarPecas(reserva.quantidade)}, às ${formatarHora(reserva.criadaEm)}`,
    whatsapp: formatarWhatsapp(reserva.whatsapp),
    linkWhatsApp: linkWhatsApp(reserva.whatsapp),
    entrega: reserva.endereco ?? "A combinar pelo WhatsApp",
    feitaEm: formatarDataHora(reserva.criadaEm),
  };
}

export type DadosLinha = ReturnType<typeof textosDaReserva> & {
  idDetalhes: string;
  cancelada: boolean;
  pago: boolean;
  entregue: boolean;
  aberta: boolean;
};

export type AcoesLinha = {
  alternarDetalhes: (aberta: boolean) => void;
  marcarPago: (marcado: boolean) => void;
  marcarEntregue: (marcado: boolean) => void;
};

export type LinhaReservaViewProps = {
  dados: DadosLinha;
  acoes: AcoesLinha;
};
