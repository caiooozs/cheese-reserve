import "server-only";
import { redirect } from "next/navigation";
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
  const { supabase, userId, admin } = await sessaoAtual();
  if (!userId) {
    redirect("/admin/login");
  }
  if (!admin) {
    redirect("/admin/login?erro=sem-acesso");
  }
  return { supabase, userId };
}
