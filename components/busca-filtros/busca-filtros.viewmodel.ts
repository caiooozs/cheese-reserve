import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  urlDosFiltros,
  type BuscaFiltrosViewProps,
} from "@/components/busca-filtros/busca-filtros.model";
import { normalizarCodigoBusca } from "@/lib/codigo";
import { contarFiltros, estaFiltrando, rotuloLimpar } from "@/lib/filtros";
import type { FiltrosPainel } from "@/lib/schemas";

// Os filtros vivem na URL: o servidor lê, valida e lista. Aqui só se navega.
export function useBuscaFiltrosViewModel(filtros: FiltrosPainel): BuscaFiltrosViewProps {
  const router = useRouter();
  const [atualizando, iniciar] = useTransition();
  const [codigo, setCodigo] = useState(filtros.codigo ?? "");
  const quantidadeFiltros = contarFiltros(filtros);
  const [filtrosAbertos, setFiltrosAbertos] = useState(quantidadeFiltros > 0);

  function ir(novos: Partial<FiltrosPainel>) {
    iniciar(() => router.push(urlDosFiltros(novos), { scroll: false }));
  }

  // Mudar um filtro encerra a busca por código, e vice-versa.
  function aoMudar<Campo extends "pagamento" | "entrega" | "situacao">(campo: Campo) {
    return (evento: { target: { value: string } }) => {
      setCodigo("");
      ir({ ...filtros, codigo: undefined, [campo]: evento.target.value || undefined });
    };
  }

  return {
    dados: {
      filtrosAbertos,
      quantidadeFiltros,
      rotuloLimpar: estaFiltrando(filtros) ? rotuloLimpar(filtros) : null,
      atualizando,
    },
    campos: {
      codigo: {
        value: codigo,
        onChange: (evento) => setCodigo(normalizarCodigoBusca(evento.target.value)),
      },
      pagamento: { value: filtros.pagamento ?? "", onChange: aoMudar("pagamento") },
      entrega: { value: filtros.entrega ?? "", onChange: aoMudar("entrega") },
      situacao: { value: filtros.situacao, onChange: aoMudar("situacao") },
    },
    acoes: {
      buscar(evento) {
        evento.preventDefault();
        // O código acha a reserva em qualquer situação, então os filtros saem.
        ir({ codigo: codigo || undefined });
      },
      alternarFiltros: () => setFiltrosAbertos((aberto) => !aberto),
      limpar() {
        setCodigo("");
        ir({});
      },
    },
  };
}
