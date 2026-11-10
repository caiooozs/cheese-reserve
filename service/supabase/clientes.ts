import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

export type ClienteSupabase = SupabaseClient<Database>;

function credenciais() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) {
    throw new Error("Defina SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY.");
  }
  return { url, chave };
}

// Página pública: sem sessão e sem cookies, sempre como anon.
export function clientePublico(): ClienteSupabase {
  const { url, chave } = credenciais();
  return createClient<Database>(url, chave, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Painel e login: sessão da usuária nos cookies.
export async function clienteDaSessao(): Promise<ClienteSupabase> {
  const { url, chave } = credenciais();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, chave, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaGravar) {
        try {
          cookiesParaGravar.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components não gravam cookies; o proxy.ts renova a sessão.
        }
      },
    },
  });
}
