import { beforeAll, describe, expect, it } from "vitest";
import { clienteAdmin, clienteAnon, prepararVenda, reservar, vitrine } from "./helpers";

const PERMISSAO_NEGADA = "42501";
const anon = clienteAnon();

describe("o público (anon)", () => {
  let reservaId: string;

  beforeAll(async () => {
    const admin = await prepararVenda({ total: 20 });
    const { data } = await reservar(anon, { p_nome: "Original" });
    const { data: linha } = await admin
      .from("reservas")
      .select("id")
      .eq("codigo", data!.codigo)
      .single();
    reservaId = linha!.id;
  });

  it.each(["reservas", "configuracao", "admins"] as const)(
    "não lê a tabela %s",
    async (tabela) => {
      const { data, error } = await anon.from(tabela).select("*");
      expect(error?.code).toBe(PERMISSAO_NEGADA);
      expect(data).toBeNull();
    },
  );

  it("não lê os totais", async () => {
    const { data, error } = await anon.from("totais_venda").select("*");
    expect(error?.code).toBe(PERMISSAO_NEGADA);
    expect(data).toBeNull();
  });

  it("não insere, altera nem apaga reservas", async () => {
    const insercao = await anon.from("reservas").insert({
      codigo: "AAAAA2",
      nome: "Invasor",
      whatsapp: "11987654321",
      quantidade: 1,
      preco_unitario_centavos: 1,
    });
    expect(insercao.error?.code).toBe(PERMISSAO_NEGADA);

    const alteracao = await anon
      .from("reservas")
      .update({ nome: "Invasor" })
      .eq("id", reservaId);
    expect(alteracao.error?.code).toBe(PERMISSAO_NEGADA);

    const remocao = await anon.from("reservas").delete().eq("id", reservaId);
    expect(remocao.error?.code).toBe(PERMISSAO_NEGADA);

    const admin = await clienteAdmin();
    const { data } = await admin
      .from("reservas")
      .select("nome")
      .eq("id", reservaId)
      .single();
    expect(data?.nome).toBe("Original");
  });

  it("não altera preço nem estoque", async () => {
    const antes = await vitrine();
    const { error } = await anon
      .from("configuracao")
      .update({ preco_centavos: 1, estoque_disponivel: 999 })
      .eq("id", 1);
    expect(error?.code).toBe(PERMISSAO_NEGADA);
    expect(await vitrine()).toEqual(antes);
  });

  it("não chama as funções do painel nem a geração de código", async () => {
    const chamadas = await Promise.all([
      anon.rpc("alterar_quantidade", {
        p_reserva_id: reservaId,
        p_nova_quantidade: 5,
      }),
      anon.rpc("cancelar_reserva", { p_reserva_id: reservaId }),
      anon.rpc("definir_estoque_total", { p_total: 999 }),
      anon.rpc("gerar_codigo_reserva"),
      anon.rpc("is_admin"),
    ]);

    for (const { error } of chamadas) {
      expect(error?.code).toBe(PERMISSAO_NEGADA);
    }
  });
});
