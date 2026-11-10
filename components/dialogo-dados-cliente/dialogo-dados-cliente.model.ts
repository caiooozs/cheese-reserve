import type { ChangeEvent, FormEvent } from "react";
import type { RefCallBack } from "react-hook-form";
import type { z } from "zod";
import { schemaDadosCliente } from "@/lib/schemas";
import type { ReservaPainelDTO } from "@/lib/tipos";
import { formatarWhatsapp } from "@/lib/whatsapp";

export { schemaDadosCliente as schemaDadosFormulario };
export type EntradaDados = z.input<typeof schemaDadosCliente>;
export type SaidaDados = z.output<typeof schemaDadosCliente>;

// Começa com o que está salvo, o WhatsApp já com a máscara.
export function valoresIniciais(reserva: ReservaPainelDTO): EntradaDados {
  return {
    nome: reserva.nome,
    whatsapp: formatarWhatsapp(reserva.whatsapp),
    endereco: reserva.endereco ?? "",
  };
}

export type CampoDados = {
  input: {
    name: string;
    value: string;
    ref: RefCallBack;
    onBlur: () => void;
    onChange: (evento: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  };
  erro?: string;
};

export type DialogoDadosViewProps = {
  dados: {
    aberto: boolean;
    descricao: string;
    alterado: boolean;
    salvando: boolean;
  };
  campos: Record<"nome" | "whatsapp" | "endereco", CampoDados>;
  acoes: {
    mudarAberto: (aberto: boolean) => void;
    terminarTransicao: (aberto: boolean) => void;
    salvar: (evento: FormEvent<HTMLFormElement>) => void;
  };
};
