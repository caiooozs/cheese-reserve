"use server";

import { revalidatePath } from "next/cache";
import { erroDeRegra } from "@/lib/erros";
import {
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
import { criarReserva, definirStatus } from "@/service/reservas/reservas.service";
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

  const resultado = await criarReserva(validacao.data);

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

async function salvarStatus(
  entrada: unknown,
  schema: typeof schemaStatusPagamento | typeof schemaStatusEntrega,
  campo: "status_pagamento" | "status_entrega",
): Promise<ResultadoAcao> {
  const validacao = schema.safeParse(entrada);
  if (!validacao.success) {
    return { ok: false, erro: "dados_invalidos" };
  }

  const admin = await obterAdmin();
  if (!admin) {
    return { ok: false, erro: "nao_autorizado" };
  }

  const { id, status } = validacao.data;
  const resultado = await definirStatus(
    admin.supabase,
    id,
    campo === "status_pagamento"
      ? { campo, valor: status as "pendente" | "pago" }
      : { campo, valor: status as "pendente" | "entregue" },
  );

  if (!resultado.ok) {
    return {
      ok: false,
      erro: erroDeRegra(resultado.codigo) ? resultado.codigo : "erro_inesperado",
    };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function definirPagamento(entrada: unknown): Promise<ResultadoAcao> {
  return salvarStatus(entrada, schemaStatusPagamento, "status_pagamento");
}

export async function definirEntrega(entrada: unknown): Promise<ResultadoAcao> {
  return salvarStatus(entrada, schemaStatusEntrega, "status_entrega");
}
