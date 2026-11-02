import "server-only";
import type { z } from "zod";
import { erroDeRegra } from "@/lib/erros";
import type { schemaReserva } from "@/lib/schemas";
import type { ComprovanteDTO } from "@/lib/tipos";
import { registrarErro } from "@/service/supabase/registrar-erro";
import { clientePublico } from "@/service/supabase/clientes";

type DadosReserva = z.output<typeof schemaReserva>;

export async function criarReserva(
  dados: DadosReserva,
): Promise<{ ok: true; comprovante: ComprovanteDTO } | { ok: false; codigo: string }> {
  const { data, error } = await clientePublico()
    .rpc("criar_reserva", {
      p_nome: dados.nome,
      p_whatsapp: dados.whatsapp,
      p_quantidade: dados.quantidade,
      p_preco_esperado_centavos: dados.precoEsperadoCentavos,
      p_chave_envio: dados.chaveEnvio,
      ...(dados.endereco ? { p_endereco: dados.endereco } : {}),
    })
    .single();

  if (error) {
    if (!erroDeRegra(error.message)) {
      registrarErro("criar_reserva", error);
    }
    return { ok: false, codigo: error.message };
  }

  return {
    ok: true,
    comprovante: {
      codigo: data.codigo,
      nome: dados.nome,
      quantidade: data.quantidade,
      valorTotalCentavos: data.valor_total_centavos,
      endereco: dados.endereco,
      criadaEm: data.criada_em,
    },
  };
}
