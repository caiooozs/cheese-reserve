import { z } from "zod";
import { normalizarCodigoBusca } from "@/lib/codigo";
import { LIMITE_POR_RESERVA } from "@/lib/constantes";
import { reaisParaCentavos } from "@/lib/dinheiro";
import { normalizarWhatsapp, whatsappValido } from "@/lib/whatsapp";

// Mesmas regras no navegador (feedback) e nas Server Actions (segurança).

// O formulário público fala com o cliente; o painel fala com a vendedora.
export function campoNomeCom(mensagemVazio: string) {
  return z.string().trim().min(2, mensagemVazio).max(80, "Use no máximo 80 caracteres.");
}

export const campoNome = campoNomeCom("Informe seu nome.");

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

// Configuração da venda ---------------------------------------------

// Preço e estoque são colunas integer: acima disso o banco recusaria com um
// erro genérico.
const MAXIMO_DO_BANCO = 2_147_483_647;

export const campoPreco = z
  .string()
  .trim()
  .min(1, "Informe o preço por peça.")
  .refine(
    (texto) => reaisParaCentavos(texto) !== null,
    "Use só números, com vírgula nos centavos. Exemplo: 45,90",
  )
  .transform((texto) => reaisParaCentavos(texto) as number)
  .pipe(
    z
      .number()
      .positive("Informe um preço maior que zero.")
      .max(MAXIMO_DO_BANCO, "Preço alto demais. Confira o valor."),
  );

export const schemaPreco = z.object({ preco: campoPreco });

export const campoTotal = z
  .number({ error: "Informe o total de queijos." })
  .int("Use um número inteiro de queijos.")
  .min(0, "O total não pode ser negativo.")
  .max(MAXIMO_DO_BANCO, "Total alto demais. Confira o número.");

export const schemaEstoqueTotal = z.object({ total: campoTotal });

export const schemaAbertura = z.object({ abertas: z.boolean() });

// Correções de reserva ---------------------------------------------

export const schemaIdReserva = z.object({ id: z.uuid() });

// No painel não vale o limite de 10 do formulário público (FR-028).
export const campoQuantidadePainel = z
  .number({ error: "Escolha a quantidade." })
  .int("Use um número inteiro de peças.")
  .min(1, "A quantidade mínima é 1 peça. Para desistir, cancele a reserva.")
  .max(MAXIMO_DO_BANCO, "Quantidade alta demais. Confira o número.");

export const schemaAlterarQuantidade = z.object({
  id: z.uuid(),
  quantidade: campoQuantidadePainel,
});

// Mesmas regras do formulário público para nome, WhatsApp e endereço.
export const schemaDadosCliente = z.object({
  nome: campoNomeCom("Informe o nome do cliente."),
  whatsapp: campoWhatsapp,
  endereco: campoEndereco,
});

export const schemaCorrigirDados = schemaDadosCliente.extend({ id: z.uuid() });
