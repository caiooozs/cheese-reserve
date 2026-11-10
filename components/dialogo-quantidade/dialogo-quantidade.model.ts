import type { ChangeEvent, FormEvent } from "react";
import type { RefCallBack } from "react-hook-form";
import { z } from "zod";
import { formatarPecas, formatarReais } from "@/lib/formatacao";
import { campoQuantidadePainel } from "@/lib/schemas";
import type { ReservaPainelDTO } from "@/lib/tipos";

// O preço da peça foi fixado quando a reserva nasceu (FR-037): total ÷ quantidade
// é exato, porque o total é sempre quantidade × esse preço.
export function precoDaReserva(reserva: Pick<ReservaPainelDTO, "valorTotalCentavos" | "quantidade">) {
  return Math.round(reserva.valorTotalCentavos / reserva.quantidade);
}

// O máximo é o que ela já tem mais o que está disponível agora.
export function schemaQuantidadeDialogo(atual: number, disponivel: number) {
  const maximo = atual + disponivel;
  return z.object({
    quantidade: campoQuantidadePainel.max(
      maximo,
      disponivel === 0
        ? "Não há peças disponíveis agora: dá só para diminuir."
        : `Há ${formatarPecas(disponivel)} ${disponivel === 1 ? "disponível" : "disponíveis"}: o máximo para esta reserva é ${formatarPecas(maximo)}.`,
    ),
  });
}
export type EntradaQuantidade = z.input<ReturnType<typeof schemaQuantidadeDialogo>>;
export type SaidaQuantidade = z.output<ReturnType<typeof schemaQuantidadeDialogo>>;

// Diz de onde vem o máximo: o que a reserva já tem mais o que está livre.
export function textoDoLimite(atual: number, disponivel: number) {
  if (disponivel === 0) {
    return "Não há peças disponíveis agora: dá só para diminuir.";
  }
  const livres = `${disponivel} ${disponivel === 1 ? "disponível" : "disponíveis"}`;
  return `Até ${formatarPecas(atual + disponivel)}: ${atual} desta reserva e mais ${livres}.`;
}

// Prévia do que muda: só exibição. Quem calcula de verdade é o banco.
export function previaDaQuantidade(atual: number, nova: number, precoCentavos: number) {
  if (!Number.isInteger(nova) || nova < 1) {
    return null;
  }
  const diferenca = nova - atual;
  return {
    titulo: diferenca === 0 ? "Total atual" : "Novo total",
    conta: `${formatarPecas(nova)} × ${formatarReais(precoCentavos)}`,
    total: formatarReais(nova * precoCentavos),
    efeito:
      diferenca === 0
        ? "Mude a quantidade para ver o novo total."
        : diferenca > 0
          ? `Saem mais ${formatarPecas(diferenca)} do estoque.`
          : `Voltam ${formatarPecas(-diferenca)} para o estoque.`,
  };
}

export type CampoQuantidade = {
  input: {
    name: string;
    value: string;
    ref: RefCallBack;
    onBlur: () => void;
    onChange: (evento: ChangeEvent<HTMLInputElement>) => void;
  };
  erro?: string;
};

export type DadosDialogoQuantidade = {
  aberto: boolean;
  descricao: string;
  limite: string;
  preco: string;
  previa: ReturnType<typeof previaDaQuantidade>;
  podeDiminuir: boolean;
  podeAumentar: boolean;
  alterado: boolean;
  salvando: boolean;
};

export type AcoesDialogoQuantidade = {
  mudarAberto: (aberto: boolean) => void;
  terminarTransicao: (aberto: boolean) => void;
  diminuir: () => void;
  aumentar: () => void;
  salvar: (evento: FormEvent<HTMLFormElement>) => void;
};

export type DialogoQuantidadeViewProps = {
  dados: DadosDialogoQuantidade;
  campos: { quantidade: CampoQuantidade };
  acoes: AcoesDialogoQuantidade;
};
