"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { erroDeRegra } from "@/lib/erros";
import {
  schemaAlterarQuantidade,
  schemaCorrigirDados,
  schemaIdReserva,
  schemaReserva,
  schemaStatusEntrega,
  schemaStatusPagamento,
} from "@/lib/schemas";
import type {
  CampoReserva,
  CodigoErroPublico,
  ResultadoAcao,
  ResultadoReserva,
  VitrineDTO,
} from "@/lib/tipos";
import { obterAdmin } from "@/service/auth/auth.service";
import * as reservas from "@/service/reservas/reservas.service";
import type { ClienteSupabase } from "@/service/supabase/clientes";
import { registrarErro } from "@/service/supabase/registrar-erro";
import { obterVitrine } from "@/service/vitrine/vitrine.service";

const CAMPOS_VISIVEIS = ["nome", "whatsapp", "quantidade", "endereco"];

// Erros que dependem do estado da venda: a tela precisa dos números atuais.
const ERROS_COM_VITRINE = [
  "preco_alterado",
  "estoque_insuficiente",
  "reservas_encerradas",
  "venda_fechada",
];

async function vitrineAtual(): Promise<VitrineDTO | undefined> {
  try {
    return await obterVitrine();
  } catch (erro) {
    registrarErro("vitrine_apos_erro", erro);
    return undefined;
  }
}

export async function reservar(entrada: unknown): Promise<ResultadoReserva> {
  const validacao = schemaReserva.safeParse(entrada);

  if (!validacao.success) {
    const campos: Partial<Record<CampoReserva, string>> = {};
    for (const { path, message } of validacao.error.issues) {
      const campo = String(path[0]);
      if (CAMPOS_VISIVEIS.includes(campo)) {
        campos[campo as CampoReserva] ??= message;
      }
    }
    return Object.keys(campos).length > 0
      ? { ok: false, erro: "validacao", campos }
      : { ok: false, erro: "dados_invalidos" };
  }

  // Campo-armadilha: só robôs preenchem. Responde sucesso sem criar nada.
  if (validacao.data.site) {
    return { ok: true, comprovante: null };
  }

  const resultado = await reservas.criarReserva(validacao.data);

  if (resultado.ok) {
    revalidatePath("/");
    revalidatePath("/admin");
    return resultado;
  }

  const { codigo } = resultado;
  return {
    ok: false,
    erro: erroDeRegra(codigo) ? (codigo as CodigoErroPublico) : "erro_inesperado",
    vitrine: ERROS_COM_VITRINE.includes(codigo) ? await vitrineAtual() : undefined,
  };
}

// Painel ------------------------------------------------------------

type ResultadoServico = { ok: true } | { ok: false; codigo: string };

// Valida, confere a sessão, executa e atualiza as páginas afetadas. Mudanças
// de quantidade e cancelamento mexem no disponível, que a página pública mostra.
async function noPainel<Schema extends z.ZodType>(
  entrada: unknown,
  schema: Schema,
  executar: (supabase: ClienteSupabase, dados: z.output<Schema>) => Promise<ResultadoServico>,
  { mudaVitrine = false }: { mudaVitrine?: boolean } = {},
): Promise<ResultadoAcao> {
  const validacao = schema.safeParse(entrada);
  if (!validacao.success) {
    return { ok: false, erro: "dados_invalidos" };
  }

  const admin = await obterAdmin();
  if (!admin) {
    return { ok: false, erro: "nao_autorizado" };
  }

  const resultado = await executar(admin.supabase, validacao.data);
  if (!resultado.ok) {
    return {
      ok: false,
      erro: erroDeRegra(resultado.codigo) ? resultado.codigo : "erro_inesperado",
    };
  }

  revalidatePath("/admin");
  if (mudaVitrine) {
    revalidatePath("/");
  }
  return { ok: true };
}

export async function definirPagamento(entrada: unknown): Promise<ResultadoAcao> {
  return noPainel(entrada, schemaStatusPagamento, (supabase, { id, status }) =>
    reservas.definirStatus(supabase, id, { campo: "status_pagamento", valor: status }),
  );
}

export async function definirEntrega(entrada: unknown): Promise<ResultadoAcao> {
  return noPainel(entrada, schemaStatusEntrega, (supabase, { id, status }) =>
    reservas.definirStatus(supabase, id, { campo: "status_entrega", valor: status }),
  );
}

export async function alterarQuantidade(entrada: unknown): Promise<ResultadoAcao> {
  return noPainel(
    entrada,
    schemaAlterarQuantidade,
    (supabase, { id, quantidade }) => reservas.alterarQuantidade(supabase, id, quantidade),
    { mudaVitrine: true },
  );
}

export async function cancelarReserva(entrada: unknown): Promise<ResultadoAcao> {
  return noPainel(
    entrada,
    schemaIdReserva,
    (supabase, { id }) => reservas.cancelarReserva(supabase, id),
    { mudaVitrine: true },
  );
}

export async function corrigirDados(entrada: unknown): Promise<ResultadoAcao> {
  return noPainel(entrada, schemaCorrigirDados, (supabase, { id, ...dados }) =>
    reservas.corrigirDados(supabase, id, dados),
  );
}
