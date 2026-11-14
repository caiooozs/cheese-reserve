import { useState } from "react";
import {
  textoComprovante,
  type AcoesComprovante,
  type DadosComprovante,
} from "@/components/comprovante/comprovante.model";
import { toast } from "@/components/ui/toast";
import { formatarDataHora, formatarPecas, formatarReais } from "@/lib/formatacao";
import { chavePixFormatada, PIX } from "@/lib/pagamento";
import type { ComprovanteDTO } from "@/lib/tipos";

// O comprovante só aparece depois de uma ação no navegador,
// então pode olhar `navigator` direto.
export function useComprovanteViewModel(
  comprovante: ComprovanteDTO,
  onNovaReserva: () => void,
): { dados: DadosComprovante; acoes: AcoesComprovante } {
  const [copiado, setCopiado] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);
  const texto = textoComprovante(comprovante);

  return {
    dados: {
      codigo: comprovante.codigo,
      nome: comprovante.nome,
      quantidade: formatarPecas(comprovante.quantidade),
      total: formatarReais(comprovante.valorTotalCentavos),
      entrega: comprovante.endereco ?? "Combinar pelo WhatsApp",
      feitaEm: formatarDataHora(comprovante.criadaEm),
      entregaLonga: (comprovante.endereco?.length ?? 0) > 24,
      copiado,
      podeCompartilhar: typeof navigator.share === "function",
      pix: { chave: chavePixFormatada(), tipo: PIX.tipo },
      pixCopiado,
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
      // Copia só os dígitos: é o formato que os apps de banco aceitam na chave celular.
      async copiarPix() {
        try {
          await navigator.clipboard.writeText(PIX.chave);
          setPixCopiado(true);
          setTimeout(() => setPixCopiado(false), 2500);
        } catch {
          toast.add({
            title: "Não deu para copiar. Digite a chave no app do banco.",
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
