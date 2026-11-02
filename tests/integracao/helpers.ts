import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type Cliente = SupabaseClient<Database>;
type ParametrosReserva = Database["public"]["Functions"]["criar_reserva"]["Args"];

export const SENHA_TESTE = "senha-teste-123";
export const ADMIN_ID = "00000000-0000-0000-0000-0000000000a1";
export const COMUM_ID = "00000000-0000-0000-0000-0000000000b2";

function variavel(nome: string) {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(
      `Defina ${nome} em .env.test.local (valores de \`npx supabase status -o env\`).`,
    );
  }
  return valor;
}

const URL_TESTE = variavel("TESTE_SUPABASE_URL");
const CHAVE_TESTE = variavel("TESTE_SUPABASE_PUBLISHABLE_KEY");

// Os testes apagam e cancelam reservas: nunca podem apontar para o remoto.
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(URL_TESTE)) {
  throw new Error("Os testes de integração só rodam contra o Supabase local.");
}

function novoCliente(): Cliente {
  return createClient<Database>(URL_TESTE, CHAVE_TESTE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function clienteAnon() {
  return novoCliente();
}

async function entrar(email: string) {
  const cliente = novoCliente();
  const { error } = await cliente.auth.signInWithPassword({
    email,
    password: SENHA_TESTE,
  });
  if (error) throw error;
  return cliente;
}

export function clienteAdmin() {
  return entrar("admin@teste.local");
}

export function clienteComum() {
  return entrar("comum@teste.local");
}

// Deixa a venda num estado conhecido: nenhuma reserva ativa, preço,
// abertura e total definidos. Devolve o cliente admin.
export async function prepararVenda({
  precoCentavos = 5000,
  total = 20,
  abertas = true,
}: { precoCentavos?: number; total?: number; abertas?: boolean } = {}) {
  const admin = await clienteAdmin();

  const { data: ativas, error } = await admin
    .from("reservas")
    .select("id")
    .is("cancelada_em", null);
  if (error) throw error;

  for (const { id } of ativas) {
    const { error: erroCancelar } = await admin.rpc("cancelar_reserva", {
      p_reserva_id: id,
    });
    if (erroCancelar) throw erroCancelar;
  }

  const { error: erroConfiguracao } = await admin
    .from("configuracao")
    .update({ preco_centavos: precoCentavos, reservas_abertas: abertas })
    .eq("id", 1);
  if (erroConfiguracao) throw erroConfiguracao;

  const { error: erroTotal } = await admin.rpc("definir_estoque_total", {
    p_total: total,
  });
  if (erroTotal) throw erroTotal;

  return admin;
}

export async function vitrine(cliente: Cliente = clienteAnon()) {
  const { data, error } = await cliente.rpc("obter_vitrine").single();
  if (error) throw error;
  return data;
}

// Chama criar_reserva com dados válidos e o preço atual; `parciais` sobrescreve.
export async function reservar(
  cliente: Cliente,
  parciais: Partial<ParametrosReserva> = {},
) {
  const { preco_centavos } = await vitrine(cliente);
  return cliente
    .rpc("criar_reserva", {
      p_nome: "Maria Teste",
      p_whatsapp: "11987654321",
      p_quantidade: 1,
      p_preco_esperado_centavos: preco_centavos,
      p_chave_envio: crypto.randomUUID(),
      ...parciais,
    })
    .single();
}
