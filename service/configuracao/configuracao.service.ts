import "server-only";
import { erroDeRegra } from "@/lib/erros";
import { registrarErro } from "@/service/supabase/registrar-erro";
import type { ClienteSupabase } from "@/service/supabase/clientes";

// Recebem o client da sessão já conferido como admin (obterAdmin). O banco
// confere de novo: a política e a função só aceitam a admin.

type Resultado = { ok: true } | { ok: false; codigo: string; n?: number };

async function atualizarConfiguracao(
  supabase: ClienteSupabase,
  contexto: string,
  mudanca: { preco_centavos: number } | { reservas_abertas: boolean },
): Promise<Resultado> {
  const { data, error } = await supabase
    .from("configuracao")
    .update(mudanca)
    .eq("id", 1)
    .select("id");

  if (error) {
    registrarErro(contexto, error);
    return { ok: false, codigo: "erro_inesperado" };
  }
  // A política esconde a linha de quem não é admin: nada muda e nada volta.
  if (data.length === 0) {
    return { ok: false, codigo: "nao_autorizado" };
  }
  return { ok: true };
}

export function definirPreco(supabase: ClienteSupabase, centavos: number) {
  return atualizarConfiguracao(supabase, "definir_preco", { preco_centavos: centavos });
}

export function definirReservasAbertas(supabase: ClienteSupabase, abertas: boolean) {
  return atualizarConfiguracao(supabase, "definir_reservas_abertas", {
    reservas_abertas: abertas,
  });
}

// O disponível é recalculado pela função, sob a trava da configuração.
export async function definirEstoqueTotal(
  supabase: ClienteSupabase,
  total: number,
): Promise<Resultado> {
  const { error } = await supabase.rpc("definir_estoque_total", { p_total: total });
  if (!error) {
    return { ok: true };
  }

  if (error.message === "estoque_abaixo_do_reservado") {
    // A mensagem diz quantas peças estão reservadas agora (FR-035).
    const { data, error: erroTotais } = await supabase
      .from("totais_venda")
      .select("pecas_reservadas")
      .single();
    if (erroTotais) {
      registrarErro("pecas_reservadas", erroTotais);
    }
    const n = data?.pecas_reservadas ?? undefined;
    return { ok: false, codigo: error.message, ...(n === undefined ? {} : { n }) };
  }

  if (!erroDeRegra(error.message)) {
    registrarErro("definir_estoque_total", error);
  }
  return { ok: false, codigo: error.message };
}
