import { beforeEach, describe, expect, it } from "vitest";
import { LIMITE_POR_RESERVA } from "@/lib/constantes";
import { clienteAdmin, clienteAnon, prepararVenda, reservar, vitrine } from "./helpers";

const anon = clienteAnon();

describe("obter_vitrine", () => {
  it("devolve só preço, estoque e abertura", async () => {
    await prepararVenda({ precoCentavos: 4590, total: 7 });
    expect(await vitrine()).toEqual({
      preco_centavos: 4590,
      estoque_disponivel: 7,
      reservas_abertas: true,
    });
  });
});

describe("criar_reserva", () => {
  beforeEach(async () => {
    await prepararVenda({ precoCentavos: 5000, total: 20 });
  });

  it("devolve código no formato combinado", async () => {
    const { data, error } = await reservar(anon);
    expect(error).toBeNull();
    expect(data?.codigo).toMatch(
      /^(?=.*[A-Z])(?=.*\d)[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/,
    );
  });

  it("desconta o estoque, calcula o total e copia o preço para a reserva", async () => {
    const { data } = await reservar(anon, {
      p_nome: "  Maria Silva  ",
      p_quantidade: 3,
      p_endereco: "  Rua A, 10  ",
    });
    expect(data).toMatchObject({ quantidade: 3, valor_total_centavos: 15000 });
    expect((await vitrine()).estoque_disponivel).toBe(17);

    const admin = await clienteAdmin();
    const { data: linha } = await admin
      .from("reservas")
      .select("nome, endereco, preco_unitario_centavos, status_pagamento, status_entrega")
      .eq("codigo", data!.codigo)
      .single();
    expect(linha).toEqual({
      nome: "Maria Silva",
      endereco: "Rua A, 10",
      preco_unitario_centavos: 5000,
      status_pagamento: "pendente",
      status_entrega: "pendente",
    });
  });

  it("aceita reserva sem endereço", async () => {
    const { data, error } = await reservar(anon);
    expect(error).toBeNull();

    const admin = await clienteAdmin();
    const { data: linha } = await admin
      .from("reservas")
      .select("endereco")
      .eq("codigo", data!.codigo)
      .single();
    expect(linha?.endereco).toBeNull();
  });

  it("aceita até o limite por reserva e recusa fora dele", async () => {
    const dentro = await reservar(anon, { p_quantidade: LIMITE_POR_RESERVA });
    expect(dentro.error).toBeNull();

    const acima = await reservar(anon, { p_quantidade: LIMITE_POR_RESERVA + 1 });
    expect(acima.error?.message).toBe("quantidade_invalida");

    const zero = await reservar(anon, { p_quantidade: 0 });
    expect(zero.error?.message).toBe("quantidade_invalida");
  });

  it("recusa quando o preço é 0 (ainda não abriu)", async () => {
    await prepararVenda({ precoCentavos: 0, total: 20 });
    const { error } = await reservar(anon);
    expect(error?.message).toBe("venda_fechada");
  });

  it("recusa com as reservas encerradas e não muda o estoque", async () => {
    await prepararVenda({ total: 20, abertas: false });
    const { error } = await reservar(anon);
    expect(error?.message).toBe("reservas_encerradas");
    expect((await vitrine()).estoque_disponivel).toBe(20);
  });

  it("recusa se o preço mudou e não cria nada", async () => {
    const { error } = await reservar(anon, { p_preco_esperado_centavos: 4900 });
    expect(error?.message).toBe("preco_alterado");
    expect((await vitrine()).estoque_disponivel).toBe(20);
  });

  it("recusa quantidade acima do disponível", async () => {
    await prepararVenda({ total: 2 });
    const { error } = await reservar(anon, { p_quantidade: 3 });
    expect(error?.message).toBe("estoque_insuficiente");
    expect((await vitrine()).estoque_disponivel).toBe(2);
  });

  it("disputa pelas últimas peças: só uma reserva passa", async () => {
    await prepararVenda({ total: 3 });
    const resultados = await Promise.all(
      Array.from({ length: 5 }, () => reservar(anon, { p_quantidade: 3 })),
    );

    expect(resultados.filter((r) => !r.error)).toHaveLength(1);
    expect(
      resultados.filter((r) => r.error?.message === "estoque_insuficiente"),
    ).toHaveLength(4);
    expect((await vitrine()).estoque_disponivel).toBe(0);
  });

  it("mesmo envio repetido gera uma reserva só, também em paralelo", async () => {
    const chave = crypto.randomUUID();
    const resultados = await Promise.all(
      Array.from({ length: 4 }, () =>
        reservar(anon, { p_quantidade: 2, p_chave_envio: chave }),
      ),
    );

    expect(resultados.every((r) => !r.error)).toBe(true);
    expect(new Set(resultados.map((r) => r.data?.codigo)).size).toBe(1);
    expect((await vitrine()).estoque_disponivel).toBe(18);
  });

  it("repetir um envio que deu certo não falha, mesmo com as reservas já encerradas", async () => {
    const chave = crypto.randomUUID();
    const primeira = await reservar(anon, { p_chave_envio: chave });

    const admin = await clienteAdmin();
    await admin.from("configuracao").update({ reservas_abertas: false }).eq("id", 1);

    const repetida = await reservar(anon, { p_chave_envio: chave });
    expect(repetida.error).toBeNull();
    expect(repetida.data?.codigo).toBe(primeira.data?.codigo);
  });

  it.each([
    ["nome com 1 caractere", { p_nome: "a" }],
    ["nome só com espaços", { p_nome: "    " }],
    ["WhatsApp com 9 dígitos", { p_whatsapp: "987654321" }],
    ["endereço com 201 caracteres", { p_endereco: "a".repeat(201) }],
  ])("recusa %s e não muda o estoque", async (_, parciais) => {
    const { error } = await reservar(anon, parciais);
    expect(error?.message).toBe("dados_invalidos");
    expect((await vitrine()).estoque_disponivel).toBe(20);
  });
});
