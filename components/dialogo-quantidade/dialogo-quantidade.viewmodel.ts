import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useController, useForm } from "react-hook-form";
import {
  precoDaReserva,
  previaDaQuantidade,
  schemaQuantidadeDialogo,
  textoDoLimite,
  type DialogoQuantidadeViewProps,
  type EntradaQuantidade,
  type SaidaQuantidade,
} from "@/components/dialogo-quantidade/dialogo-quantidade.model";
import type { ControleDialogo } from "@/components/linha-reserva/linha-reserva.model";
import { toast } from "@/components/ui/toast";
import { MENSAGEM_GENERICA, traduzirErro } from "@/lib/erros";
import { formatarPecas, formatarReais } from "@/lib/formatacao";
import type { ReservaPainelDTO } from "@/lib/tipos";
import { alterarQuantidade } from "@/service/reservas/reservas.actions";

// Erros em que a reserva mudou por fora: avisa, fecha e traz a lista de novo.
const ERROS_QUE_FECHAM = ["reserva_paga", "reserva_cancelada", "reserva_nao_encontrada"];

export function useDialogoQuantidadeViewModel(
  reserva: ReservaPainelDTO,
  disponivel: number,
  controle: ControleDialogo,
): DialogoQuantidadeViewProps {
  const router = useRouter();
  const [salvando, iniciar] = useTransition();
  const preco = precoDaReserva(reserva);
  const maximo = reserva.quantidade + disponivel;

  const form = useForm<EntradaQuantidade, unknown, SaidaQuantidade>({
    resolver: zodResolver(schemaQuantidadeDialogo(reserva.quantidade, disponivel)),
    defaultValues: { quantidade: reserva.quantidade },
  });
  const quantidade = useController({ name: "quantidade", control: form.control });
  const pecas = quantidade.field.value;
  const valida = Number.isInteger(pecas) && pecas >= 1;

  async function enviar({ quantidade: nova }: SaidaQuantidade) {
    let resultado;
    try {
      resultado = await alterarQuantidade({ id: reserva.id, quantidade: nova });
    } catch {
      toast.add({ title: MENSAGEM_GENERICA, type: "error" });
      return;
    }

    if (resultado.ok) {
      toast.add({
        title: `Quantidade alterada para ${formatarPecas(nova)}.`,
        description: `Reserva ${reserva.codigo}. Novo total: ${formatarReais(nova * preco)}.`,
        type: "success",
      });
      controle.aoMudarAberto(false);
      return;
    }

    if (resultado.erro === "estoque_insuficiente" || resultado.erro === "quantidade_invalida") {
      form.setError("quantidade", { message: traduzirErro(resultado.erro) }, { shouldFocus: true });
      router.refresh();
      return;
    }

    toast.add({ title: traduzirErro(resultado.erro), type: "error" });
    if (ERROS_QUE_FECHAM.includes(resultado.erro)) {
      controle.aoMudarAberto(false);
    }
    router.refresh();
  }

  return {
    dados: {
      aberto: controle.aberto,
      descricao: `Reserva ${reserva.codigo} de ${reserva.nome}.`,
      limite: textoDoLimite(reserva.quantidade, disponivel),
      preco: formatarReais(preco),
      previa: previaDaQuantidade(reserva.quantidade, pecas, preco),
      podeDiminuir: valida && pecas > 1,
      podeAumentar: !valida || pecas < maximo,
      alterado: valida && pecas !== reserva.quantidade,
      salvando,
    },
    campos: {
      quantidade: {
        input: {
          name: quantidade.field.name,
          value: Number.isNaN(pecas) ? "" : String(pecas),
          ref: quantidade.field.ref,
          onBlur: quantidade.field.onBlur,
          onChange(evento) {
            const digitos = evento.target.value.replace(/\D/g, "");
            quantidade.field.onChange(digitos ? Number(digitos) : Number.NaN);
          },
        },
        erro: quantidade.fieldState.error?.message,
      },
    },
    acoes: {
      mudarAberto: controle.aoMudarAberto,
      terminarTransicao(aberto) {
        if (!aberto) controle.aoTerminar();
      },
      diminuir: () => quantidade.field.onChange(pecas - 1),
      aumentar: () => quantidade.field.onChange(valida ? pecas + 1 : 1),
      salvar(evento) {
        iniciar(() => form.handleSubmit(enviar)(evento));
      },
    },
  };
}
