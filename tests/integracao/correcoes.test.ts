import { describe, expect, it } from "vitest";
import {
  clienteAnon,
  clienteComum,
  prepararVenda,
  reservar,
  vitrine,
  type Cliente,
} from "./helpers";

const anon = clienteAnon();

// Cria uma reserva pela página pública e devolve o id que o painel usa.
async function novaReserva(admin: Cliente, quantidade: number, nome = "Joana Correção") {
  const { data, error } = await reservar(anon, { p_quantidade: quantidade, p_nome: nome });
  if (error) throw error;
  const { data: linha, error: erroLinha } = await admin
    .from("reservas")
    .select("id")
    .eq("codigo", data.codigo)
    .single();
  if (erroLinha) throw erroLinha;
  return { id: linha.id, codigo: data.codigo };
}

async function linha(admin: Cliente, id: string) {
  const { data, error } = await admin
    .from("reservas")
    .select(
      "codigo, nome, whatsapp, endereco, quantidade, preco_unitario_centavos, valor_total_centavos, status_pagamento, status_entrega, cancelada_em",
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function totais(admin: Cliente) {
  const { data, error } = await admin.from("totais_venda").select("*").single();
  if (error) throw error;
  return data;
}

const disponivel = async () => (await vitrine()).estoque_disponivel;

describe("alterar_quantidade", () => {
  it("aumentar desconta só a diferença e mantém o preço da reserva", async () => {
    const admin = await prepararVenda({ precoCentavos: 4590, total: 20 });
    const { id } = await novaReserva(admin, 2);
    await admin.from("configuracao").update({ preco_centavos: 5000 }).eq("id", 1);

    const { error } = await admin.rpc("alterar_quantidade", {
      p_reserva_id: id,
      p_nova_quantidade: 4,
    });

    expect(error).toBeNull();
    expect(await disponivel()).toBe(16);
    expect(await linha(admin, id)).toMatchObject({
      quantidade: 4,
      preco_unitario_centavos: 4590,
      valor_total_centavos: 18360,
    });
  });

  it("sem estoque para aumentar, recusa e nada muda", async () => {
    const admin = await prepararVenda({ total: 3 });
    const { id } = await novaReserva(admin, 2);

    const { error } = await admin.rpc("alterar_quantidade", {
      p_reserva_id: id,
      p_nova_quantidade: 5,
    });

    expect(error?.message).toBe("estoque_insuficiente");
    expect((await linha(admin, id)).quantidade).toBe(2);
    expect(await disponivel()).toBe(1);
  });

  it("diminuir devolve as peças ao estoque", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 4);
    expect(await disponivel()).toBe(16);

    await admin.rpc("alterar_quantidade", { p_reserva_id: id, p_nova_quantidade: 1 });

    expect(await disponivel()).toBe(19);
    expect((await linha(admin, id)).quantidade).toBe(1);
  });

  it("recusa zero peças", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 2);

    const { error } = await admin.rpc("alterar_quantidade", {
      p_reserva_id: id,
      p_nova_quantidade: 0,
    });

    expect(error?.message).toBe("quantidade_invalida");
    expect((await linha(admin, id)).quantidade).toBe(2);
  });

  it("aceita 12 peças, acima do limite do formulário público", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 2);

    const { error } = await admin.rpc("alterar_quantidade", {
      p_reserva_id: id,
      p_nova_quantidade: 12,
    });

    expect(error).toBeNull();
    expect(await disponivel()).toBe(8);
  });

  it("reserva paga não muda de quantidade", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 2);
    await admin.from("reservas").update({ status_pagamento: "pago" }).eq("id", id);

    const { error } = await admin.rpc("alterar_quantidade", {
      p_reserva_id: id,
      p_nova_quantidade: 3,
    });

    expect(error?.message).toBe("reserva_paga");
    expect(await disponivel()).toBe(18);
  });

  it("reserva cancelada não muda de quantidade", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 2);
    await admin.rpc("cancelar_reserva", { p_reserva_id: id });

    const { error } = await admin.rpc("alterar_quantidade", {
      p_reserva_id: id,
      p_nova_quantidade: 3,
    });

    expect(error?.message).toBe("reserva_cancelada");
    expect(await disponivel()).toBe(20);
  });

  it("reserva que não existe", async () => {
    const admin = await prepararVenda();

    const { error } = await admin.rpc("alterar_quantidade", {
      p_reserva_id: crypto.randomUUID(),
      p_nova_quantidade: 3,
    });

    expect(error?.message).toBe("reserva_nao_encontrada");
  });
});

describe("cancelar_reserva", () => {
  it("devolve o estoque, e repetir não devolve de novo", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 3);
    expect(await disponivel()).toBe(17);

    expect((await admin.rpc("cancelar_reserva", { p_reserva_id: id })).error).toBeNull();
    expect(await disponivel()).toBe(20);

    expect((await admin.rpc("cancelar_reserva", { p_reserva_id: id })).error).toBeNull();
    expect(await disponivel()).toBe(20);
    expect((await linha(admin, id)).cancelada_em).not.toBeNull();
  });

  it("reserva paga cancelada sai de Recebido", async () => {
    const admin = await prepararVenda({ precoCentavos: 5000, total: 20 });
    const { id } = await novaReserva(admin, 2);
    const outra = await novaReserva(admin, 1, "Paulo Mantém");
    await admin.from("reservas").update({ status_pagamento: "pago" }).eq("id", id);
    expect(await totais(admin)).toMatchObject({
      recebido_centavos: 10000,
      a_receber_centavos: 5000,
    });

    await admin.rpc("cancelar_reserva", { p_reserva_id: id });

    expect(await totais(admin)).toEqual({
      recebido_centavos: 0,
      a_receber_centavos: 5000,
      pecas_reservadas: 1,
    });
    expect((await linha(admin, outra.id)).cancelada_em).toBeNull();
  });
});

describe("usuário comum", () => {
  it("não altera quantidade nem cancela", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 2);
    const comum = await clienteComum();

    const alterar = await comum.rpc("alterar_quantidade", {
      p_reserva_id: id,
      p_nova_quantidade: 5,
    });
    const cancelar = await comum.rpc("cancelar_reserva", { p_reserva_id: id });

    expect(alterar.error?.message).toBe("nao_autorizado");
    expect(cancelar.error?.message).toBe("nao_autorizado");
    expect(await linha(admin, id)).toMatchObject({ quantidade: 2, cancelada_em: null });
  });
});

describe("correção dos dados do cliente", () => {
  it("muda nome, WhatsApp e endereço sem mexer em código, quantidade, valores e status", async () => {
    const admin = await prepararVenda({ precoCentavos: 4590, total: 20 });
    const { id } = await novaReserva(admin, 2);
    await admin.from("reservas").update({ status_pagamento: "pago" }).eq("id", id);
    const antes = await linha(admin, id);

    const { data, error } = await admin
      .from("reservas")
      .update({ nome: "Joana Corrigida", whatsapp: "21998877665", endereco: "Rua Nova, 5" })
      .eq("id", id)
      .select("id");

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(await linha(admin, id)).toEqual({
      ...antes,
      nome: "Joana Corrigida",
      whatsapp: "21998877665",
      endereco: "Rua Nova, 5",
    });
  });

  it("endereço pode voltar a ficar vazio", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 1);
    await admin.from("reservas").update({ endereco: "Rua A, 1" }).eq("id", id);

    await admin.from("reservas").update({ endereco: null }).eq("id", id);

    expect((await linha(admin, id)).endereco).toBeNull();
  });

  it("o banco recusa WhatsApp com 9 dígitos", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 1);

    const { error } = await admin
      .from("reservas")
      .update({ whatsapp: "987654321" })
      .eq("id", id);

    expect(error?.code).toBe("23514");
    expect((await linha(admin, id)).whatsapp).toBe("11987654321");
  });

  it("reserva cancelada não aceita correção (0 linhas)", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 1);
    await admin.rpc("cancelar_reserva", { p_reserva_id: id });

    const { data, error } = await admin
      .from("reservas")
      .update({ nome: "Não Muda" })
      .eq("id", id)
      .select("id");

    expect(error).toBeNull();
    expect(data).toEqual([]);
    expect((await linha(admin, id)).nome).toBe("Joana Correção");
  });

  it("código e quantidade não mudam por update direto", async () => {
    const admin = await prepararVenda({ total: 20 });
    const { id } = await novaReserva(admin, 1);

    const codigo = await admin.from("reservas").update({ codigo: "ZZZZZZ" }).eq("id", id);
    const quantidade = await admin.from("reservas").update({ quantidade: 9 }).eq("id", id);

    expect(codigo.error?.code).toBe("42501");
    expect(quantidade.error?.code).toBe("42501");
  });
});
