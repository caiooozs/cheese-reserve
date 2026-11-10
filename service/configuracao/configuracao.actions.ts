"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { erroDeRegra } from "@/lib/erros";
import { schemaAbertura, schemaEstoqueTotal, schemaPreco } from "@/lib/schemas";
import type { ResultadoAcao } from "@/lib/tipos";
import { obterAdmin } from "@/service/auth/auth.service";
import * as configuracao from "@/service/configuracao/configuracao.service";
import type { ClienteSupabase } from "@/service/supabase/clientes";

type Resultado = Awaited<ReturnType<typeof configuracao.definirPreco>>;

// Valida, confere a sessão, grava e atualiza as duas páginas: preço, total e
// abertura aparecem também na página pública.
async function salvar<Schema extends z.ZodType>(
  entrada: unknown,
  schema: Schema,
  gravar: (supabase: ClienteSupabase, dados: z.output<Schema>) => Promise<Resultado>,
): Promise<ResultadoAcao> {
  const validacao = schema.safeParse(entrada);
  if (!validacao.success) {
    return { ok: false, erro: "dados_invalidos" };
  }

  const admin = await obterAdmin();
  if (!admin) {
    return { ok: false, erro: "nao_autorizado" };
  }

  const resultado = await gravar(admin.supabase, validacao.data);
  if (!resultado.ok) {
    return erroDeRegra(resultado.codigo)
      ? { ok: false, erro: resultado.codigo, ...(resultado.n === undefined ? {} : { n: resultado.n }) }
      : { ok: false, erro: "erro_inesperado" };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function definirPreco(entrada: unknown): Promise<ResultadoAcao> {
  return salvar(entrada, schemaPreco, (supabase, { preco }) =>
    configuracao.definirPreco(supabase, preco),
  );
}

export async function definirEstoqueTotal(entrada: unknown): Promise<ResultadoAcao> {
  return salvar(entrada, schemaEstoqueTotal, (supabase, { total }) =>
    configuracao.definirEstoqueTotal(supabase, total),
  );
}

export async function definirReservasAbertas(entrada: unknown): Promise<ResultadoAcao> {
  return salvar(entrada, schemaAbertura, (supabase, { abertas }) =>
    configuracao.definirReservasAbertas(supabase, abertas),
  );
}
