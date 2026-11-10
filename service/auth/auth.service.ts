import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { registrarErro } from "@/service/supabase/registrar-erro";
import { clienteDaSessao } from "@/service/supabase/clientes";

async function sessaoAtual() {
  const supabase = await clienteDaSessao();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub ?? null;
  if (!userId) {
    return { supabase, userId, admin: false };
  }

  const { data: admin, error } = await supabase.rpc("is_admin");
  if (error) {
    registrarErro("is_admin", error);
  }
  return { supabase, userId, admin: admin === true };
}

// Para Server Actions: devolve null em vez de redirecionar.
export async function obterAdmin() {
  const { supabase, userId, admin } = await sessaoAtual();
  return userId && admin ? { supabase, userId } : null;
}

// Para páginas do painel. Quem está logado sem ser admin volta ao login
// sem signOut (Server Components não gravam cookies e haveria laço).
export async function exigirAdmin() {
  // getClaims confere a validade do token com a hora atual: só na visita, nunca
  // numa pré-renderização.
  await connection();
  const { supabase, userId, admin } = await sessaoAtual();
  if (!userId) {
    redirect("/admin/login");
  }
  if (!admin) {
    redirect("/admin/login?erro=sem-acesso");
  }
  return { supabase, userId };
}

// Entra e confere na hora se a conta é da vendedora: assim o login não
// redireciona para o painel só para o painel mandar de volta.
export async function entrarComSenha(
  email: string,
  senha: string,
): Promise<"ok" | "credenciais_invalidas" | "sem_acesso"> {
  const supabase = await clienteDaSessao();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) {
    if (error.code !== "invalid_credentials") {
      registrarErro("entrar", error);
    }
    return "credenciais_invalidas";
  }

  const { data: admin, error: erroAdmin } = await supabase.rpc("is_admin");
  if (erroAdmin) {
    registrarErro("is_admin", erroAdmin);
  }
  if (admin !== true) {
    await supabase.auth.signOut();
    return "sem_acesso";
  }
  return "ok";
}

export async function encerrarSessao() {
  const supabase = await clienteDaSessao();
  const { error } = await supabase.auth.signOut();
  if (error) {
    registrarErro("sair", error);
  }
}
