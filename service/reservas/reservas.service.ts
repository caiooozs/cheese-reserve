import "server-only";
import type { z } from "zod";
import { erroDeRegra } from "@/lib/erros";
import type { FiltrosPainel, schemaDadosCliente, schemaReserva } from "@/lib/schemas";
import type { ComprovanteDTO, ReservaPainelDTO, ResumoPainelDTO } from "@/lib/tipos";
import { registrarErro } from "@/service/supabase/registrar-erro";
import { clientePublico, type ClienteSupabase } from "@/service/supabase/clientes";

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

// Painel ------------------------------------------------------------
// Recebem o client da sessão já conferido como admin (obterAdmin/exigirAdmin).
// O banco confere de novo: as políticas só deixam a admin ler e alterar.

// Nunca `*`: o painel não precisa de chave de envio nem do preço unitário.
const COLUNAS_PAINEL =
  "id, codigo, nome, whatsapp, endereco, quantidade, valor_total_centavos, created_at, status_pagamento, status_entrega, cancelada_em";

export async function listarReservas(
  supabase: ClienteSupabase,
  filtros: FiltrosPainel,
): Promise<ReservaPainelDTO[]> {
  let consulta = supabase
    .from("reservas")
    .select(COLUNAS_PAINEL)
    .order("created_at", { ascending: false });

  // O código é único: acha a reserva mesmo cancelada (ela aparece marcada).
  if (filtros.codigo) {
    consulta = consulta.eq("codigo", filtros.codigo);
  } else if (filtros.situacao === "ativas") {
    consulta = consulta.is("cancelada_em", null);
  } else if (filtros.situacao === "canceladas") {
    consulta = consulta.not("cancelada_em", "is", null);
  }
  if (filtros.pagamento) consulta = consulta.eq("status_pagamento", filtros.pagamento);
  if (filtros.entrega) consulta = consulta.eq("status_entrega", filtros.entrega);

  const { data, error } = await consulta;
  if (error) {
    registrarErro("listar_reservas", error);
    throw error;
  }

  return data.map((r) => ({
    id: r.id,
    codigo: r.codigo,
    nome: r.nome,
    whatsapp: r.whatsapp,
    endereco: r.endereco,
    quantidade: r.quantidade,
    valorTotalCentavos: r.valor_total_centavos ?? 0,
    criadaEm: r.created_at,
    statusPagamento: r.status_pagamento === "pago" ? "pago" : "pendente",
    statusEntrega: r.status_entrega === "entregue" ? "entregue" : "pendente",
    cancelada: r.cancelada_em !== null,
  }));
}

// Totais sobre todas as reservas ativas, sem olhar para os filtros (FR-025).
export async function resumoPainel(supabase: ClienteSupabase): Promise<ResumoPainelDTO> {
  const [totais, configuracao] = await Promise.all([
    supabase
      .from("totais_venda")
      .select("recebido_centavos, a_receber_centavos, pecas_reservadas")
      .single(),
    supabase
      .from("configuracao")
      .select("preco_centavos, estoque_disponivel, reservas_abertas")
      .single(),
  ]);

  if (totais.error || configuracao.error) {
    const erro = totais.error ?? configuracao.error;
    registrarErro("resumo_painel", erro);
    throw erro;
  }

  const { recebido_centavos, a_receber_centavos, pecas_reservadas } = totais.data;
  const { preco_centavos, estoque_disponivel, reservas_abertas } = configuracao.data;
  const reservadas = pecas_reservadas ?? 0;

  return {
    recebidoCentavos: recebido_centavos ?? 0,
    aReceberCentavos: a_receber_centavos ?? 0,
    precoCentavos: preco_centavos,
    disponivel: estoque_disponivel,
    reservadas,
    total: estoque_disponivel + reservadas,
    reservasAbertas: reservas_abertas,
  };
}

type Status =
  | { campo: "status_pagamento"; valor: ReservaPainelDTO["statusPagamento"] }
  | { campo: "status_entrega"; valor: ReservaPainelDTO["statusEntrega"] };

export async function definirStatus(
  supabase: ClienteSupabase,
  id: string,
  status: Status,
): Promise<{ ok: true } | { ok: false; codigo: string }> {
  const { data, error } = await supabase
    .from("reservas")
    .update(
      status.campo === "status_pagamento"
        ? { status_pagamento: status.valor }
        : { status_entrega: status.valor },
    )
    .eq("id", id)
    .select("id");

  if (error) {
    registrarErro("definir_status", error);
    return { ok: false, codigo: "erro_inesperado" };
  }
  // A política só deixa alterar reservas ativas: nenhuma linha = cancelada.
  if (data.length === 0) {
    return { ok: false, codigo: "reserva_cancelada" };
  }
  return { ok: true };
}

// Correções ---------------------------------------------------------

type ResultadoServico = { ok: true } | { ok: false; codigo: string };

// Erro de regra volta como código; o resto vira erro inesperado e vai para o log.
function falhaDoBanco(contexto: string, erro: { message: string }): ResultadoServico {
  if (erroDeRegra(erro.message)) {
    return { ok: false, codigo: erro.message };
  }
  registrarErro(contexto, erro);
  return { ok: false, codigo: "erro_inesperado" };
}

// A função confere admin, reserva paga ou cancelada e estoque, tudo sob trava.
export async function alterarQuantidade(
  supabase: ClienteSupabase,
  id: string,
  quantidade: number,
): Promise<ResultadoServico> {
  const { error } = await supabase.rpc("alterar_quantidade", {
    p_reserva_id: id,
    p_nova_quantidade: quantidade,
  });
  return error ? falhaDoBanco("alterar_quantidade", error) : { ok: true };
}

// Devolve as peças ao estoque. Cancelar de novo não faz nada.
export async function cancelarReserva(
  supabase: ClienteSupabase,
  id: string,
): Promise<ResultadoServico> {
  const { error } = await supabase.rpc("cancelar_reserva", { p_reserva_id: id });
  return error ? falhaDoBanco("cancelar_reserva", error) : { ok: true };
}

// Só nome, WhatsApp e endereço: o banco não deixa mudar o resto por aqui.
export async function corrigirDados(
  supabase: ClienteSupabase,
  id: string,
  dados: z.output<typeof schemaDadosCliente>,
): Promise<ResultadoServico> {
  const { data, error } = await supabase
    .from("reservas")
    .update({ nome: dados.nome, whatsapp: dados.whatsapp, endereco: dados.endereco })
    .eq("id", id)
    .select("id");

  if (error) {
    registrarErro("corrigir_dados", error);
    // CHECK do banco: os dados passaram pelo zod, então isso é raro.
    return { ok: false, codigo: error.code === "23514" ? "dados_invalidos" : "erro_inesperado" };
  }
  // A política só deixa alterar reservas ativas: nenhuma linha = cancelada.
  if (data.length === 0) {
    return { ok: false, codigo: "reserva_cancelada" };
  }
  return { ok: true };
}
