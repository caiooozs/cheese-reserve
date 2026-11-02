import { useState } from "react";
import {
  carimboDaData,
  textoComprovante,
  type AcoesComprovante,
  type DadosComprovante,
} from "@/components/comprovante/comprovante.model";
import { toast } from "@/components/ui/toast";
import { formatarDataHora, formatarPecas, formatarReais } from "@/lib/formatacao";
import { SAUDACAO } from "@/lib/produto";
import type { ComprovanteDTO } from "@/lib/tipos";

// O comprovante só aparece depois de uma ação no navegador,
// então pode olhar `navigator` direto.
export function useComprovanteViewModel(
  comprovante: ComprovanteDTO,
  onNovaReserva: () => void,
): { dados: DadosComprovante; acoes: AcoesComprovante } {
  const [copiado, setCopiado] = useState(false);
  const texto = textoComprovante(comprovante);

  return {
    dados: {
      codigo: comprovante.codigo,
      nome: comprovante.nome,
      quantidade: formatarPecas(comprovante.quantidade),
      total: formatarReais(comprovante.valorTotalCentavos),
      entrega: comprovante.endereco ?? "combinar pelo WhatsApp",
      feitaEm: formatarDataHora(comprovante.criadaEm),
      saudacao: SAUDACAO,
      entregaLonga: (comprovante.endereco?.length ?? 0) > 28,
      carimbo: carimboDaData(comprovante.criadaEm),
      copiado,
      podeCompartilhar: typeof navigator.share === "function",
    },
    acoes: {
      // A confirmação fica no botão: um toast cobriria a tela que vai para o print.
      async copiar() {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2500);
        } catch {
          toast.add({
            title: "Não deu para copiar. Tire um print da tela.",
            type: "error",
          });
        }
      },
      async compartilhar() {
        try {
          await navigator.share({ text: texto });
        } catch (erro) {
          if (erro instanceof DOMException && erro.name === "AbortError") return;
          toast.add({
            title: "Não deu para compartilhar. Use o botão Copiar.",
            type: "error",
          });
        }
      },
      novaReserva: onNovaReserva,
    },
  };
}
