import { BuscaFiltros } from "@/components/busca-filtros/busca-filtros.container";
import { ListaReservas } from "@/components/lista-reservas/lista-reservas";
import type { ReservasFiltradasViewProps } from "@/components/reservas-filtradas/reservas-filtradas.model";

export function ReservasFiltradasView({ dados, busca }: ReservasFiltradasViewProps) {
  return (
    <>
      <BuscaFiltros filtros={dados.filtros} busca={busca} />
      <ListaReservas
        reservas={dados.visiveis}
        hoje={dados.hoje}
        filtrando={dados.filtrando}
        buscando={dados.buscando}
        situacao={dados.filtros.situacao}
        disponivel={dados.disponivel}
      />
    </>
  );
}
