import type { ChangeEvent, FormEvent } from "react";
import type { RefCallBack } from "react-hook-form";
import { z } from "zod";
import { LIMITE_POR_RESERVA } from "@/lib/constantes";
import {
  campoEndereco,
  campoNome,
  campoQuantidadeAte,
  campoWhatsapp,
} from "@/lib/schemas";
import type { ComprovanteDTO, EstadoVitrine, VitrineDTO } from "@/lib/tipos";

export function estadoDaVitrine(v: VitrineDTO): EstadoVitrine {
  if (v.precoCentavos === 0) return "nao_abriu";
  if (!v.reservasAbertas) return "encerrada";
  if (v.disponivel === 0) return "esgotada";
  return "aberta";
}

export function quantidadeMaxima(v: VitrineDTO) {
  return Math.min(LIMITE_POR_RESERVA, v.disponivel);
}

export function schemaReservaFormulario(disponivel: number) {
  return z.object({
    nome: campoNome,
    whatsapp: campoWhatsapp,
    quantidade: campoQuantidadeAte(Math.min(LIMITE_POR_RESERVA, disponivel)),
    endereco: campoEndereco,
  });
}

type SchemaFormulario = ReturnType<typeof schemaReservaFormulario>;
export type EntradaFormulario = z.input<SchemaFormulario>;
export type SaidaFormulario = z.output<SchemaFormulario>;

export const VALORES_INICIAIS: EntradaFormulario = {
  nome: "",
  whatsapp: "",
  quantidade: 1,
  endereco: "",
};

export type CampoFormulario = {
  input: {
    name: string;
    value: string;
    ref: RefCallBack;
    onBlur: () => void;
    onChange: (evento: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  };
  erro?: string;
};

export type DadosFormulario = {
  estado: EstadoVitrine;
  comprovante: ComprovanteDTO | null;
  recebida: boolean;
  enviando: boolean;
  preco: string;
  disponibilidade: string;
  limite: string;
  total: string | null;
  precoNovo: string | null;
  podeDiminuir: boolean;
  podeAumentar: boolean;
};

export type CamposFormulario = Record<keyof EntradaFormulario, CampoFormulario>;

export type AcoesFormulario = {
  enviar: (evento: FormEvent<HTMLFormElement>) => void;
  diminuir: () => void;
  aumentar: () => void;
  novaReserva: () => void;
};

export type FormularioReservaViewProps = {
  dados: DadosFormulario;
  campos: CamposFormulario;
  acoes: AcoesFormulario;
};
