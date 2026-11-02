import { z } from "zod";
import { normalizarCodigoBusca } from "@/lib/codigo";
import { LIMITE_POR_RESERVA } from "@/lib/constantes";
import { normalizarWhatsapp, whatsappValido } from "@/lib/whatsapp";

// Mesmas regras no navegador (feedback) e nas Server Actions (segurança).

export const campoNome = z
  .string()
  .trim()
  .min(2, "Informe seu nome.")
  .max(80, "Use no máximo 80 caracteres.");

export const campoWhatsapp = z
  .string()
  .transform(normalizarWhatsapp)
  .refine(whatsappValido, "WhatsApp inválido. Informe DDD e número.");

export const campoEndereco = z
  .string()
  .trim()
  .max(200, "Use no máximo 200 caracteres.")
  .nullish()
  .transform((valor) => valor || null);

export function campoQuantidadeAte(maximo: number) {
  const mensagem =
    maximo === 1 ? "Só há 1 peça disponível." : `Escolha de 1 a ${maximo} peças.`;
  return z
    .number({ error: "Escolha a quantidade." })
    .int(mensagem)
    .min(1, mensagem)
    .max(maximo, mensagem);
}

export const schemaReserva = z.object({
  nome: campoNome,
  whatsapp: campoWhatsapp,
  quantidade: campoQuantidadeAte(LIMITE_POR_RESERVA),
  endereco: campoEndereco,
  precoEsperadoCentavos: z.number().int().positive(),
  chaveEnvio: z.uuid(),
  site: z.string().optional(),
});

// Painel ------------------------------------------------------------

export const PAGAMENTOS = ["pendente", "pago"] as const;
export const ENTREGAS = ["pendente", "entregue"] as const;
export const SITUACOES = ["ativas", "canceladas", "todas"] as const;

// A URL pode trazer o parâmetro repetido (?a=1&a=2): vale o primeiro.
const primeiro = (valor: unknown) => (Array.isArray(valor) ? valor[0] : valor);

// Filtros vêm da URL, que qualquer um pode editar: valor estranho é ignorado.
export const schemaFiltrosPainel = z.object({
  codigo: z
    .preprocess(primeiro, z.string().optional())
    .catch(undefined)
    .transform((valor) => (valor ? normalizarCodigoBusca(valor) || undefined : undefined)),
  pagamento: z.preprocess(primeiro, z.enum(PAGAMENTOS).optional()).catch(undefined),
  entrega: z.preprocess(primeiro, z.enum(ENTREGAS).optional()).catch(undefined),
  situacao: z.preprocess(primeiro, z.enum(SITUACOES)).catch("ativas"),
});

export type FiltrosPainel = z.output<typeof schemaFiltrosPainel>;

export const schemaStatusPagamento = z.object({
  id: z.uuid(),
  status: z.enum(PAGAMENTOS),
});

export const schemaStatusEntrega = z.object({
  id: z.uuid(),
  status: z.enum(ENTREGAS),
});
