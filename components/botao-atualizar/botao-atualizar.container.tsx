"use client";

import { BotaoAtualizarView } from "@/components/botao-atualizar/botao-atualizar.view";
import { useBotaoAtualizarViewModel } from "@/components/botao-atualizar/botao-atualizar.viewmodel";

export function BotaoAtualizar() {
  const { dados, acoes } = useBotaoAtualizarViewModel();
  return <BotaoAtualizarView dados={dados} acoes={acoes} />;
}
