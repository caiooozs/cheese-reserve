import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  urlDosFiltros,
  type BuscaFiltrosViewProps,
} from "@/components/busca-filtros/busca-filtros.model";
import type { ControleBusca } from "@/components/reservas-filtradas/reservas-filtradas.model";
import { limparBusca } from "@/lib/busca";
import { contarFiltros, rotuloLimpar } from "@/lib/filtros";
import type { FiltrosPainel } from "@/lib/schemas";

// Pagamento, entrega e situação vivem na URL: o servidor lê, valida e lista.
// O texto da busca vem de fora (ReservasFiltradas), que filtra a lista na hora.
export function useBuscaFiltrosViewModel(
  filtros: FiltrosPainel,
  busca: ControleBusca,
): BuscaFiltrosViewProps {
  const router = useRouter();
  const [atualizando, iniciar] = useTransition();
  const quantidadeFiltros = contarFiltros(filtros);
  const [filtrosAbertos, setFiltrosAbertos] = useState(quantidadeFiltros > 0);

  const buscaAtual = limparBusca(busca.valor) || undefined;
  const comBusca = { ...filtros, busca: buscaAtual };

  function ir(novos: Partial<FiltrosPainel>) {
    iniciar(() => router.push(urlDosFiltros(novos), { scroll: false }));
  }

  // Mudar um filtro mantém a busca digitada.
  function aoMudar<Campo extends "pagamento" | "entrega" | "situacao">(campo: Campo) {
    return (evento: { target: { value: string } }) => {
      ir({ ...comBusca, [campo]: evento.target.value || undefined });
    };
  }

  return {
    dados: {
      filtrosAbertos,
      quantidadeFiltros,
      // Só a busca já tem o X no campo: o botão de baixo aparece quando há filtro.
      rotuloLimpar: quantidadeFiltros > 0 ? rotuloLimpar(comBusca) : null,
      atualizando,
      temBusca: busca.valor.length > 0,
    },
    campos: {
      busca: {
        value: busca.valor,
        onChange: (evento) => busca.mudar(evento.target.value),
      },
      pagamento: { value: filtros.pagamento ?? "", onChange: aoMudar("pagamento") },
      entrega: { value: filtros.entrega ?? "", onChange: aoMudar("entrega") },
      situacao: { value: filtros.situacao, onChange: aoMudar("situacao") },
    },
    acoes: {
      // A lista já filtra a cada tecla: o Enter só fecha o teclado do celular.
      buscar(evento) {
        evento.preventDefault();
        evento.currentTarget.querySelector("input")?.blur();
      },
      limparBusca: busca.limpar,
      alternarFiltros: () => setFiltrosAbertos((aberto) => !aberto),
      limpar() {
        busca.limpar();
        ir({});
      },
    },
  };
}
