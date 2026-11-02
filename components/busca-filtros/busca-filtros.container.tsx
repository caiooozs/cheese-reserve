"use client";

import { BuscaFiltrosView } from "@/components/busca-filtros/busca-filtros.view";
import { useBuscaFiltrosViewModel } from "@/components/busca-filtros/busca-filtros.viewmodel";
import type { FiltrosPainel } from "@/lib/schemas";

export function BuscaFiltros({ filtros }: { filtros: FiltrosPainel }) {
  const { dados, campos, acoes } = useBuscaFiltrosViewModel(filtros);
  return <BuscaFiltrosView dados={dados} campos={campos} acoes={acoes} />;
}
