import { RefreshCwIcon } from "lucide-react";
import type { BotaoAtualizarViewProps } from "@/components/botao-atualizar/botao-atualizar.model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BotaoAtualizarView({ dados, acoes }: BotaoAtualizarViewProps) {
  return (
    <>
      <Button
        variant="ghost"
        onClick={acoes.atualizar}
        disabled={dados.atualizando}
        className="h-11 px-3 text-base"
      >
        <RefreshCwIcon
          aria-hidden
          className={cn("size-5", dados.atualizando && "animate-spin motion-reduce:animate-none")}
        />
        {dados.atualizando ? "Atualizando…" : "Atualizar"}
      </Button>
      <span role="status" className="sr-only">
        {dados.aviso}
      </span>
    </>
  );
}
