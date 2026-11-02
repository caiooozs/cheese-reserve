"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ResultadoAcao } from "@/lib/tipos";
import { encerrarSessao, entrarComSenha } from "@/service/auth/auth.service";

const schemaEntrada = z.object({
  email: z.email(),
  senha: z.string().min(1),
});

// Qualquer falha devolve o mesmo código: a tela não revela se o e-mail existe.
export async function entrar(entrada: unknown): Promise<ResultadoAcao> {
  const validacao = schemaEntrada.safeParse(entrada);
  if (!validacao.success) {
    return { ok: false, erro: "credenciais_invalidas" };
  }

  const resultado = await entrarComSenha(validacao.data.email, validacao.data.senha);
  if (resultado !== "ok") {
    return { ok: false, erro: resultado };
  }

  redirect("/admin");
}

export async function sair() {
  await encerrarSessao();
  redirect("/admin/login");
}
