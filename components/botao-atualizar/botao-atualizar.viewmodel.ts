import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { BotaoAtualizarViewProps } from "@/components/botao-atualizar/botao-atualizar.model";

// Busca de novo, no servidor, os totais e a lista do painel, sem recarregar a
// página: filtros, busca e detalhes abertos continuam como estão.
export function useBotaoAtualizarViewModel(): BotaoAtualizarViewProps {
  const router = useRouter();
  const [atualizando, iniciar] = useTransition();
  const [aviso, setAviso] = useState("");
  const pediu = useRef(false);

  // Avisa leitores de tela quando a atualização pedida termina.
  useEffect(() => {
    if (!atualizando && pediu.current) {
      pediu.current = false;
      setAviso("Reservas atualizadas.");
    }
  }, [atualizando]);

  return {
    dados: { atualizando, aviso },
    acoes: {
      atualizar() {
        pediu.current = true;
        setAviso("");
        iniciar(() => router.refresh());
      },
    },
  };
}
