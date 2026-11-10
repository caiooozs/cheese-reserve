import type { FiltrosPainel } from "@/lib/schemas";

// Quantos filtros (fora a busca por código) estão mudando a lista.
export function contarFiltros(filtros: FiltrosPainel) {
  return [
    filtros.pagamento,
    filtros.entrega,
    filtros.situacao !== "ativas" ? filtros.situacao : undefined,
  ].filter(Boolean).length;
}

export function estaFiltrando(filtros: FiltrosPainel) {
  return Boolean(filtros.codigo) || contarFiltros(filtros) > 0;
}

// O botão diz o que vai limpar.
export function rotuloLimpar(filtros: FiltrosPainel) {
  const temFiltro = contarFiltros(filtros) > 0;
  if (filtros.codigo && temFiltro) return "Limpar busca e filtros";
  return filtros.codigo ? "Limpar busca" : "Limpar filtros";
}
