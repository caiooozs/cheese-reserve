import { formatarDataHora, formatarPecas, formatarReais } from "@/lib/formatacao";
import type { ComprovanteDTO } from "@/lib/tipos";

// Texto que vai para o WhatsApp. O Intl usa espaço não separável em "R$ 100,00".
export function textoComprovante(c: ComprovanteDTO) {
  return [
    `Reserva de queijo ${c.codigo}`,
    `Nome: ${c.nome}`,
    `Quantidade: ${formatarPecas(c.quantidade)}`,
    `Total: ${formatarReais(c.valorTotalCentavos).replace(/ /g, " ")}`,
    ...(c.endereco ? [`Entrega: ${c.endereco}`] : []),
    `Feita em ${formatarDataHora(c.criadaEm)}`,
  ].join("\n");
}

export type DadosComprovante = {
  codigo: string;
  nome: string;
  quantidade: string;
  total: string;
  entrega: string;
  feitaEm: string;
  entregaLonga: boolean;
  copiado: boolean;
  podeCompartilhar: boolean;
};

export type AcoesComprovante = {
  copiar: () => void;
  compartilhar: () => void;
  novaReserva: () => void;
};

export type ComprovanteViewProps = {
  dados: DadosComprovante;
  acoes: AcoesComprovante;
};
