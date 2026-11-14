"use client";

import { BuscaFiltrosView } from "@/components/busca-filtros/busca-filtros.view";
import { useBuscaFiltrosViewModel } from "@/components/busca-filtros/busca-filtros.viewmodel";
import type { ControleBusca } from "@/components/reservas-filtradas/reservas-filtradas.model";
import type { FiltrosPainel } from "@/lib/schemas";

export function BuscaFiltros({ filtros, busca }: { filtros: FiltrosPainel; busca: ControleBusca }) {
  const { dados, campos, acoes } = useBuscaFiltrosViewModel(filtros, busca);
  return <BuscaFiltrosView dados={dados} campos={campos} acoes={acoes} />;
}
