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

async function pecasReservadas(admin: Cliente) {
  const { data, error } = await admin.from("totais_venda").select("pecas_reservadas").single();
  if (error) throw error;
  return data.pecas_reservadas ?? 0;
}

async function reservarOuFalhar(quantidade: number) {
  const { data, error } = await reservar(anon, { p_quantidade: quantidade });
  if (error) throw error;
  return data;
}

describe("definir_estoque_total", () => {
  it("calcula o disponível como total menos as peças reservadas", async () => {
    const admin = await prepararVenda({ total: 20 });
    await reservarOuFalhar(6);
    await reservarOuFalhar(4);

    const { data, error } = await admin.rpc("definir_estoque_total", { p_total: 30 }).single();

    expect(error).toBeNull();
    expect(data).toEqual({ estoque_disponivel: 20, pecas_reservadas: 10 });
    expect((await vitrine()).estoque_disponivel).toBe(20);
  });

  it("recusa total abaixo do reservado e não muda nada", async () => {
    const admin = await prepararVenda({ total: 20 });
    await reservarOuFalhar(10);

    const { error } = await admin.rpc("definir_estoque_total", { p_total: 8 });

    expect(error?.message).toBe("estoque_abaixo_do_reservado");
    expect((await vitrine()).estoque_disponivel).toBe(10);
    expect(await pecasReservadas(admin)).toBe(10);
  });

  it("aceita total igual ao reservado (fica esgotado)", async () => {
    const admin = await prepararVenda({ total: 20 });
    await reservarOuFalhar(10);

    const { error } = await admin.rpc("definir_estoque_total", { p_total: 10 });

    expect(error).toBeNull();
    expect((await vitrine()).estoque_disponivel).toBe(0);
  });

  it("aumentar o total de uma venda esgotada volta a ter peças", async () => {
    const admin = await prepararVenda({ total: 20 });
    await reservarOuFalhar(10);
    await reservarOuFalhar(10);
    expect((await vitrine()).estoque_disponivel).toBe(0);

    await admin.rpc("definir_estoque_total", { p_total: 30 });

    expect((await vitrine()).estoque_disponivel).toBe(10);
    const { error } = await reservar(anon, { p_quantidade: 1 });
    expect(error).toBeNull();
  });

  it("recusa total negativo", async () => {
    const admin = await prepararVenda({ total: 20 });

    const { error } = await admin.rpc("definir_estoque_total", { p_total: -1 });

    expect(error?.message).toBe("quantidade_invalida");
    expect((await vitrine()).estoque_disponivel).toBe(20);
  });

  it("usuário comum não define o total, e o público nem chama a função", async () => {
    await prepararVenda({ total: 20 });
    const comum = await clienteComum();

    const deComum = await comum.rpc("definir_estoque_total", { p_total: 99 });
    expect(deComum.error?.message).toBe("nao_autorizado");

    const doPublico = await anon.rpc("definir_estoque_total", { p_total: 99 });
    expect(doPublico.error?.code).toBe("42501");

    expect((await vitrine()).estoque_disponivel).toBe(20);
  });

  it("em paralelo com reservas, total = disponível + reservadas", async () => {
    const admin = await prepararVenda({ total: 5 });

    // Reservas de 1 peça disputam as 5 enquanto o total sobe para 30.
    const resultados = await Promise.all([
      ...Array.from({ length: 8 }, () => reservar(anon, { p_quantidade: 1 })),
      admin.rpc("definir_estoque_total", { p_total: 30 }),
    ]);

    const definir = resultados.at(-1)!;
    expect(definir.error).toBeNull();

    const aceitas = resultados.slice(0, -1).filter((r) => !r.error).length;
    const reservadas = await pecasReservadas(admin);
    const { estoque_disponivel } = await vitrine();

    expect(reservadas).toBe(aceitas);
    expect(estoque_disponivel + reservadas).toBe(30);
  });
});

describe("preço", () => {
  it("mudar o preço não altera reservas existentes, e as novas usam o preço novo", async () => {
    const admin = await prepararVenda({ precoCentavos: 4590, total: 20 });
    const antiga = await reservarOuFalhar(2);

    const { data: alteradas, error } = await admin
      .from("configuracao")
      .update({ preco_centavos: 5000 })
      .eq("id", 1)
      .select("preco_centavos");
    expect(error).toBeNull();
    expect(alteradas).toEqual([{ preco_centavos: 5000 }]);

    const nova = await reservarOuFalhar(2);

    const { data: linhas } = await admin
      .from("reservas")
      .select("codigo, preco_unitario_centavos, valor_total_centavos")
      .in("codigo", [antiga.codigo, nova.codigo]);
    const porCodigo = new Map(linhas!.map((l) => [l.codigo, l]));

    expect(porCodigo.get(antiga.codigo)).toMatchObject({
      preco_unitario_centavos: 4590,
      valor_total_centavos: 9180,
    });
    expect(porCodigo.get(nova.codigo)).toMatchObject({
      preco_unitario_centavos: 5000,
      valor_total_centavos: 10000,
    });
  });

  it("o banco recusa preço negativo", async () => {
    const admin = await prepararVenda({ precoCentavos: 5000 });

    const { error } = await admin
      .from("configuracao")
      .update({ preco_centavos: -1 })
      .eq("id", 1);

    expect(error?.code).toBe("23514");
    expect((await vitrine()).preco_centavos).toBe(5000);
  });
});

describe("abertura das reservas", () => {
  it("encerrar e reabrir aparece em obter_vitrine", async () => {
    const admin = await prepararVenda({ abertas: true });

    await admin.from("configuracao").update({ reservas_abertas: false }).eq("id", 1);
    expect((await vitrine()).reservas_abertas).toBe(false);

    await admin.from("configuracao").update({ reservas_abertas: true }).eq("id", 1);
    expect((await vitrine()).reservas_abertas).toBe(true);
  });

  it("usuário comum não muda preço nem abertura", async () => {
    await prepararVenda({ precoCentavos: 5000, abertas: true });
    const comum = await clienteComum();

    const { data, error } = await comum
      .from("configuracao")
      .update({ preco_centavos: 1, reservas_abertas: false })
      .eq("id", 1)
      .select("id");

    expect(error).toBeNull();
    expect(data).toEqual([]);
    expect(await vitrine()).toMatchObject({ preco_centavos: 5000, reservas_abertas: true });
  });
});

describe("estoque disponível", () => {
  it("nem a admin altera direto: só pela função", async () => {
    const admin = await prepararVenda({ total: 20 });

    const { error } = await admin
      .from("configuracao")
      .update({ estoque_disponivel: 999 })
      .eq("id", 1);

    expect(error?.code).toBe("42501");
    expect((await vitrine()).estoque_disponivel).toBe(20);
  });
});
