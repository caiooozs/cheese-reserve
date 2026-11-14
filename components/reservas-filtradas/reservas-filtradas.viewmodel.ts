import { useEffect, useMemo, useState } from "react";
import { urlDosFiltros } from "@/components/busca-filtros/busca-filtros.model";
import type {
  PropsReservasFiltradas,
  ReservasFiltradasViewProps,
} from "@/components/reservas-filtradas/reservas-filtradas.model";
import { combinaComBusca, limparBusca } from "@/lib/busca";
import { estaFiltrando } from "@/lib/filtros";

// Espera depois da última tecla antes de gravar a busca na URL.
const ESPERA_MS = 300;

// A busca por nome ou código filtra no navegador, a cada tecla: a lista já está
// toda aqui (dezenas de reservas). Navegar a cada letra esconderia o painel e
// tiraria o foco do campo. A URL é atualizada sem navegar, para os filtros e o
// botão Atualizar manterem a busca.
export function useReservasFiltradasViewModel({
  filtros,
  reservas,
  hoje,
  disponivel,
}: PropsReservasFiltradas): ReservasFiltradasViewProps {
  const [busca, setBusca] = useState(filtros.busca ?? "");
  const buscaAtual = limparBusca(busca) || undefined;

  const visiveis = useMemo(
    () => (buscaAtual ? reservas.filter((r) => combinaComBusca(r, buscaAtual)) : reservas),
    [reservas, buscaAtual],
  );

  useEffect(() => {
    const espera = setTimeout(() => {
      const url = urlDosFiltros({ ...filtros, busca: buscaAtual });
      if (url !== window.location.pathname + window.location.search) {
        window.history.replaceState(null, "", url);
      }
    }, ESPERA_MS);
    return () => clearTimeout(espera);
  }, [filtros, buscaAtual]);

  return {
    dados: {
      filtros,
      visiveis,
      filtrando: estaFiltrando({ ...filtros, busca: buscaAtual }),
      buscando: Boolean(buscaAtual),
      hoje,
      disponivel,
    },
    busca: {
      valor: busca,
      mudar: setBusca,
      limpar: () => setBusca(""),
    },
  };
}
