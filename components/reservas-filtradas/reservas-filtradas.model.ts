import type { FiltrosPainel } from "@/lib/schemas";
import type { ReservaPainelDTO } from "@/lib/tipos";

// O texto da busca mora aqui e é passado para o campo e para a lista.
export type ControleBusca = {
  valor: string;
  mudar: (texto: string) => void;
  limpar: () => void;
};

export type PropsReservasFiltradas = {
  filtros: FiltrosPainel;
  reservas: ReservaPainelDTO[];
  hoje: string;
  disponivel: number;
};

export type ReservasFiltradasViewProps = {
  dados: {
    filtros: FiltrosPainel;
    visiveis: ReservaPainelDTO[];
    filtrando: boolean;
    buscando: boolean;
    hoje: string;
    disponivel: number;
  };
  busca: ControleBusca;
};
