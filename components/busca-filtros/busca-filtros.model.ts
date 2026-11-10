import type { ChangeEvent, FormEvent } from "react";
import type { ENTREGAS, FiltrosPainel, PAGAMENTOS, SITUACOES } from "@/lib/schemas";

type Opcao<T extends string> = { valor: T | ""; rotulo: string };

export const OPCOES_PAGAMENTO: Opcao<(typeof PAGAMENTOS)[number]>[] = [
  { valor: "", rotulo: "Todos" },
  { valor: "pendente", rotulo: "Falta pagar" },
  { valor: "pago", rotulo: "Pago" },
];

export const OPCOES_ENTREGA: Opcao<(typeof ENTREGAS)[number]>[] = [
  { valor: "", rotulo: "Todas" },
  { valor: "pendente", rotulo: "Falta entregar" },
  { valor: "entregue", rotulo: "Entregue" },
];

export const OPCOES_SITUACAO: Opcao<(typeof SITUACOES)[number]>[] = [
  { valor: "ativas", rotulo: "Ativas" },
  { valor: "canceladas", rotulo: "Canceladas" },
  { valor: "todas", rotulo: "Ativas e canceladas" },
];

// Monta a URL do painel só com o que foge do padrão.
export function urlDosFiltros(filtros: Partial<FiltrosPainel>) {
  const parametros = new URLSearchParams();
  if (filtros.codigo) parametros.set("codigo", filtros.codigo);
  if (filtros.pagamento) parametros.set("pagamento", filtros.pagamento);
  if (filtros.entrega) parametros.set("entrega", filtros.entrega);
  if (filtros.situacao && filtros.situacao !== "ativas") {
    parametros.set("situacao", filtros.situacao);
  }
  const busca = parametros.toString();
  return busca ? `/admin?${busca}` : "/admin";
}

type CampoSelecao = {
  value: string;
  onChange: (evento: ChangeEvent<HTMLSelectElement>) => void;
};

export type DadosBusca = {
  filtrosAbertos: boolean;
  quantidadeFiltros: number;
  // Nulo quando não há busca nem filtro para limpar.
  rotuloLimpar: string | null;
  atualizando: boolean;
};

export type CamposBusca = {
  codigo: {
    value: string;
    onChange: (evento: ChangeEvent<HTMLInputElement>) => void;
  };
  pagamento: CampoSelecao;
  entrega: CampoSelecao;
  situacao: CampoSelecao;
};

export type AcoesBusca = {
  buscar: (evento: FormEvent<HTMLFormElement>) => void;
  alternarFiltros: () => void;
  limpar: () => void;
};

export type BuscaFiltrosViewProps = {
  dados: DadosBusca;
  campos: CamposBusca;
  acoes: AcoesBusca;
};
