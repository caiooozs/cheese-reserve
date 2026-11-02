"use server";

import { revalidatePath } from "next/cache";
import { erroDeRegra } from "@/lib/erros";
import { schemaReserva } from "@/lib/schemas";
import type {
  CampoReserva,
  CodigoErroPublico,
  ResultadoReserva,
  VitrineDTO,
} from "@/lib/tipos";
import { criarReserva } from "@/service/reservas/reservas.service";
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
