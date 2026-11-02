import { beforeEach, describe, expect, it } from "vitest";
import {
  clienteAnon,
  clienteComum,
  prepararVenda,
  reservar,
  type Cliente,
} from "./helpers";

// Mesmas colunas que service/reservas/reservas.service.ts pede para o painel.
const COLUNAS_PAINEL =
  "id, codigo, nome, whatsapp, endereco, quantidade, valor_total_centavos, created_at, status_pagamento, status_entrega, cancelada_em";

const anon = clienteAnon();

async function totais(cliente: Cliente) {
  const { data, error } = await cliente.from("totais_venda").select("*").single();
  if (error) throw error;
  return data;
}

describe("painel: leitura e status", () => {
  let admin: Cliente;
  let reserva: { id: string; codigo: string };

  beforeEach(async () => {
    admin = await prepararVenda({ precoCentavos: 5000, total: 20 });
    const { data, error } = await reservar(anon, {
      p_nome: "Ana Painel",
      p_quantidade: 2,
      p_endereco: "Rua das Flores, 10",
    });
    if (error) throw error;
    const { data: linha, error: erroLinha } = await admin
      .from("reservas")
      .select("id")
      .eq("codigo", data.codigo)
      .single();
    if (erroLinha) throw erroLinha;
    reserva = { id: linha.id, codigo: data.codigo };
  });

  it("admin acha a reserva pelo código, com as colunas do painel", async () => {
    const { data, error } = await admin
      .from("reservas")
      .select(COLUNAS_PAINEL)
      .eq("codigo", reserva.codigo)
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      id: reserva.id,
      codigo: reserva.codigo,
      nome: "Ana Painel",
      whatsapp: "11987654321",
      endereco: "Rua das Flores, 10",
      quantidade: 2,
      valor_total_centavos: 10000,
      status_pagamento: "pendente",
      status_entrega: "pendente",
      cancelada_em: null,
    });
    expect(Number.isNaN(Date.parse(data!.created_at))).toBe(false);
  });

  it("lista as mais recentes primeiro", async () => {
    const { data: nova } = await reservar(anon, { p_nome: "Bruno Depois" });

    const { data, error } = await admin
      .from("reservas")
      .select("codigo")
      .is("cancelada_em", null)
      .order("created_at", { ascending: false });

    expect(error).toBeNull();
    expect(data!.map((r) => r.codigo)).toEqual([nova!.codigo, reserva.codigo]);
  });

  it("usuário comum não vê nem altera nada", async () => {
    const comum = await clienteComum();

    for (const tabela of ["reservas", "configuracao"] as const) {
      const { data, error } = await comum.from(tabela).select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    }

    // A view soma só o que o usuário enxerga: para ele, tudo é zero.
    expect(await totais(comum)).toEqual({
      recebido_centavos: 0,
      a_receber_centavos: 0,
      pecas_reservadas: 0,
    });

    const { data: alteradas, error } = await comum
      .from("reservas")
      .update({ status_pagamento: "pago" })
      .eq("id", reserva.id)
      .select("id");
    expect(error).toBeNull();
    expect(alteradas).toEqual([]);

    const { data } = await admin
      .from("reservas")
      .select("status_pagamento")
      .eq("id", reserva.id)
      .single();
    expect(data!.status_pagamento).toBe("pendente");
  });

  it("marcar pago move o valor de A receber para Recebido, e desfazer volta", async () => {
    expect(await totais(admin)).toEqual({
      recebido_centavos: 0,
      a_receber_centavos: 10000,
      pecas_reservadas: 2,
    });

    const { data: pagas } = await admin
      .from("reservas")
      .update({ status_pagamento: "pago" })
      .eq("id", reserva.id)
      .select("id");
    expect(pagas).toHaveLength(1);
    expect(await totais(admin)).toMatchObject({
      recebido_centavos: 10000,
      a_receber_centavos: 0,
    });

    await admin
      .from("reservas")
      .update({ status_pagamento: "pendente" })
      .eq("id", reserva.id);
    expect(await totais(admin)).toMatchObject({
      recebido_centavos: 0,
      a_receber_centavos: 10000,
    });
  });

  it("entrega muda sem mexer nos totais", async () => {
    const { data } = await admin
      .from("reservas")
      .update({ status_entrega: "entregue" })
      .eq("id", reserva.id)
      .select("status_entrega, status_pagamento")
      .single();

    expect(data).toEqual({ status_entrega: "entregue", status_pagamento: "pendente" });
    expect(await totais(admin)).toMatchObject({ a_receber_centavos: 10000 });
  });

  it("reserva cancelada sai dos totais e não muda mais de status", async () => {
    await admin
      .from("reservas")
      .update({ status_pagamento: "pago" })
      .eq("id", reserva.id);
    const { error } = await admin.rpc("cancelar_reserva", { p_reserva_id: reserva.id });
    expect(error).toBeNull();

    expect(await totais(admin)).toEqual({
      recebido_centavos: 0,
      a_receber_centavos: 0,
      pecas_reservadas: 0,
    });

    const { data: alteradas } = await admin
      .from("reservas")
      .update({ status_entrega: "entregue" })
      .eq("id", reserva.id)
      .select("id");
    expect(alteradas).toEqual([]);
  });

  it("is_admin distingue a vendedora do usuário comum", async () => {
    const comum = await clienteComum();
    expect((await admin.rpc("is_admin")).data).toBe(true);
    expect((await comum.rpc("is_admin")).data).toBe(false);
  });
});
