import { formatarDataHora, formatarPecas, formatarReais } from "@/lib/formatacao";
import type { ComprovanteDTO } from "@/lib/tipos";

const FUSO = "America/Sao_Paulo";

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

// "24 DEZ 2026" e "23:30", como num carimbo de correio.
export function carimboDaData(iso: string) {
  const data = new Date(iso);
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO,
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .formatToParts(data)
      .map((p) => [p.type, p.value]),
  );
  const hora = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(data);

  const mes = partes.month.replace(".", "").toUpperCase();
  return { data: `${partes.day} ${mes} ${partes.year}`, hora };
}

export type DadosComprovante = {
  codigo: string;
  nome: string;
  quantidade: string;
  total: string;
  entrega: string;
  feitaEm: string;
  saudacao: string;
  entregaLonga: boolean;
  carimbo: { data: string; hora: string };
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
