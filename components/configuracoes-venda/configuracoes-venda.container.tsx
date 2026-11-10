"use client";

import { ConfiguracoesVendaView } from "@/components/configuracoes-venda/configuracoes-venda.view";
import { useConfiguracoesVendaViewModel } from "@/components/configuracoes-venda/configuracoes-venda.viewmodel";
import type { ResumoPainelDTO } from "@/lib/tipos";

export function ConfiguracoesVenda({ resumo }: { resumo: ResumoPainelDTO }) {
  const { dados, campos, acoes } = useConfiguracoesVendaViewModel(resumo);
  return <ConfiguracoesVendaView dados={dados} campos={campos} acoes={acoes} />;
}
