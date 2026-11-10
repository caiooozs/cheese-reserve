import type { ChangeEvent, FormEvent } from "react";
import type { RefCallBack } from "react-hook-form";
import { z } from "zod";
import { centavosParaCampo } from "@/lib/dinheiro";
import { formatarReais } from "@/lib/formatacao";
import { campoTotal, schemaPreco } from "@/lib/schemas";
import type { ResumoPainelDTO } from "@/lib/tipos";

// Preço: o mesmo schema da action, que recebe o texto em reais.
export { schemaPreco as schemaPrecoFormulario };
export type EntradaPreco = z.input<typeof schemaPreco>;
export type SaidaPreco = z.output<typeof schemaPreco>;

// Total: o campo é texto; a action recebe o número. Ficar abaixo das peças
// reservadas é conferido no envio, com o número mais recente do servidor.
export const schemaTotalFormulario = z.object({
  total: z
    .string()
    .trim()
    .min(1, "Informe o total de queijos.")
    .regex(/^\d+$/, "Use só números, sem vírgula nem ponto.")
    .transform(Number)
    .pipe(campoTotal),
});
export type EntradaTotal = z.input<typeof schemaTotalFormulario>;
export type SaidaTotal = z.output<typeof schemaTotalFormulario>;

// Preço 0 é "ainda não definido": o campo começa vazio, não com "0,00".
export function valoresIniciais(resumo: ResumoPainelDTO) {
  return {
    preco: { preco: resumo.precoCentavos > 0 ? centavosParaCampo(resumo.precoCentavos) : "" },
    total: { total: String(resumo.total) },
  };
}

// Abre sozinha enquanto falta o básico para a venda funcionar.
export function precisaConfigurar(resumo: ResumoPainelDTO) {
  return resumo.precoCentavos === 0 || resumo.total === 0;
}

export function formatarQueijos(n: number) {
  if (n === 0) return "nenhum queijo";
  return n === 1 ? "1 queijo" : `${n} queijos`;
}

// O que a página pública mostra agora, na mesma ordem dela (FR-041): sem preço
// não abriu; encerrada vem antes de esgotada. A chave guarda só a intenção.
export type SituacaoPublica = "sem_preco" | "encerrada" | "sem_queijos" | "esgotada" | "aberta";

export function situacaoPublica(resumo: ResumoPainelDTO, abertas: boolean): SituacaoPublica {
  if (resumo.precoCentavos === 0) return "sem_preco";
  if (!abertas) return "encerrada";
  if (resumo.total === 0) return "sem_queijos";
  if (resumo.disponivel === 0) return "esgotada";
  return "aberta";
}

const SITUACAO_NO_RESUMO: Record<SituacaoPublica, string> = {
  sem_preco: "reservas ainda não abertas",
  encerrada: "reservas encerradas",
  sem_queijos: "reservas ainda não abertas",
  esgotada: "esgotado",
  aberta: "aceitando reservas",
};

// A linha da faixa fechada: o estado salvo, em uma frase.
export function resumoDaVenda(resumo: ResumoPainelDTO) {
  const preco =
    resumo.precoCentavos > 0
      ? `${formatarReais(resumo.precoCentavos)} por peça`
      : "Preço não definido";
  const situacao = SITUACAO_NO_RESUMO[situacaoPublica(resumo, resumo.reservasAbertas)];
  return `${preco}, ${formatarQueijos(resumo.total)}, ${situacao}`;
}

// Mostra o efeito do total digitado antes de salvar.
export function textoDoEstoque(reservadas: number, disponivelSalvo: number, digitado: string) {
  const limpo = digitado.trim();
  const total = /^\d+$/.test(limpo) ? Number(limpo) : null;
  const previsto =
    total !== null && total >= reservadas && total - reservadas !== disponivelSalvo
      ? total - reservadas
      : null;

  const disponiveis =
    previsto === null
      ? `Disponíveis: ${disponivelSalvo}`
      : `Disponíveis: ${previsto} depois de salvar`;
  return `Reservadas: ${reservadas} · ${disponiveis}`;
}

// Ao lado da chave: o que a página pública faz de fato, não só a posição da chave.
const ESTADO_DA_CHAVE: Record<SituacaoPublica, string> = {
  sem_preco: "Abre quando houver preço",
  encerrada: "Reservas encerradas",
  sem_queijos: "Abre quando houver queijos",
  esgotada: "Esgotado",
  aberta: "Aceitando reservas",
};

const AJUDA_DA_CHAVE: Record<SituacaoPublica, string> = {
  sem_preco: "A página só abre as reservas depois que o preço for definido.",
  encerrada:
    "A página pública avisa que as reservas foram encerradas. As reservas feitas continuam aqui.",
  sem_queijos: "A página só abre as reservas depois que o total de queijos for definido.",
  esgotada:
    "Todas as peças estão reservadas e a página mostra que esgotou. Aumente o total para voltar a vender.",
  aberta: "A página pública mostra o formulário de reserva.",
};

export function textosDaAbertura(resumo: ResumoPainelDTO, abertas: boolean) {
  const situacao = situacaoPublica(resumo, abertas);
  return {
    estado: ESTADO_DA_CHAVE[situacao],
    ajuda: AJUDA_DA_CHAVE[situacao],
    // Só "aceitando" aparece em tinta cheia: o resto é a página parada.
    vendendo: situacao === "aberta",
  };
}

export type CampoTexto = {
  input: {
    name: string;
    value: string;
    ref: RefCallBack;
    onBlur: () => void;
    onChange: (evento: ChangeEvent<HTMLInputElement>) => void;
  };
  erro?: string;
};

export type DadosConfiguracoes = {
  aberta: boolean;
  resumo: string;
  estoque: string;
  abertas: boolean;
  estadoAbertura: string;
  ajudaAbertura: string;
  vendendo: boolean;
  precoAlterado: boolean;
  totalAlterado: boolean;
  salvandoPreco: boolean;
  salvandoTotal: boolean;
};

export type CamposConfiguracoes = {
  preco: CampoTexto;
  total: CampoTexto;
};

export type AcoesConfiguracoes = {
  alternar: (aberta: boolean) => void;
  salvarPreco: (evento: FormEvent<HTMLFormElement>) => void;
  salvarTotal: (evento: FormEvent<HTMLFormElement>) => void;
  alternarAbertura: (abertas: boolean) => void;
};

export type ConfiguracoesVendaViewProps = {
  dados: DadosConfiguracoes;
  campos: CamposConfiguracoes;
  acoes: AcoesConfiguracoes;
};
