import { useRouter } from "next/navigation";
import { useId, useOptimistic, useState, useTransition } from "react";
import {
  textosDaReserva,
  type Dialogo,
  type LinhaReservaViewProps,
  type StatusReserva,
} from "@/components/linha-reserva/linha-reserva.model";
import { toast } from "@/components/ui/toast";
import { traduzirErro } from "@/lib/erros";
import type { ResultadoAcao, ReservaPainelDTO } from "@/lib/tipos";
import { definirEntrega, definirPagamento } from "@/service/reservas/reservas.actions";

// Erros que pedem a página de novo: sessão vencida ou reserva cancelada noutra aba.
const ERROS_QUE_RECARREGAM = ["nao_autorizado", "reserva_cancelada"];

export function useLinhaReservaViewModel(reserva: ReservaPainelDTO): LinhaReservaViewProps {
  const router = useRouter();
  const idDetalhes = useId();
  const [aberta, setAberta] = useState(false);
  // Qual diálogo está montado, e se está aberto: fecha com animação e só
  // depois desmonta, para abrir da próxima vez com os dados atuais.
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [, iniciar] = useTransition();

  // O interruptor muda na hora; se a action falhar, volta sozinho ao que veio do servidor.
  const [status, aplicar] = useOptimistic<StatusReserva, Partial<StatusReserva>>(
    { pagamento: reserva.statusPagamento, entrega: reserva.statusEntrega },
    (atual, mudanca) => ({ ...atual, ...mudanca }),
  );

  function salvar(mudanca: Partial<StatusReserva>, acao: () => Promise<ResultadoAcao>) {
    iniciar(async () => {
      aplicar(mudanca);
      const resultado = await acao().catch(() => null);
      if (resultado?.ok) return;

      toast.add({ title: traduzirErro(resultado?.erro), type: "error" });
      if (resultado && ERROS_QUE_RECARREGAM.includes(resultado.erro)) {
        router.refresh();
      }
    });
  }

  return {
    dados: {
      ...textosDaReserva(reserva),
      idDetalhes,
      cancelada: reserva.cancelada,
      pago: status.pagamento === "pago",
      entregue: status.entrega === "entregue",
      aberta,
      avisoPago: traduzirErro("reserva_paga"),
      dialogo,
      dialogoAberto,
    },
    acoes: {
      alternarDetalhes: setAberta,
      marcarPago(marcado) {
        const pagamento = marcado ? "pago" : "pendente";
        salvar({ pagamento }, () => definirPagamento({ id: reserva.id, status: pagamento }));
      },
      marcarEntregue(marcado) {
        const entrega = marcado ? "entregue" : "pendente";
        salvar({ entrega }, () => definirEntrega({ id: reserva.id, status: entrega }));
      },
      abrirDialogo(novo) {
        setDialogo(novo);
        setDialogoAberto(true);
      },
      mudarDialogo: setDialogoAberto,
      terminarDialogo: () => setDialogo(null),
    },
  };
}
