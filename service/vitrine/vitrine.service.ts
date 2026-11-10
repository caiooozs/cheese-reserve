import "server-only";
import type { VitrineDTO } from "@/lib/tipos";
import { registrarErro } from "@/service/supabase/registrar-erro";
import { clientePublico } from "@/service/supabase/clientes";

export async function obterVitrine(): Promise<VitrineDTO> {
  const { data, error } = await clientePublico().rpc("obter_vitrine").single();
  if (error) {
    registrarErro("obter_vitrine", error);
    throw error;
  }
  return {
    precoCentavos: data.preco_centavos,
    disponivel: data.estoque_disponivel,
    reservasAbertas: data.reservas_abertas,
  };
}
