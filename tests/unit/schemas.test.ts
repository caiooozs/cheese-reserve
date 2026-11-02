import { describe, expect, it } from "vitest";
import { schemaReservaFormulario } from "@/components/formulario-reserva/formulario-reserva.model";
import {
  schemaFiltrosPainel,
  schemaReserva,
  schemaStatusEntrega,
  schemaStatusPagamento,
} from "@/lib/schemas";

const valida = {
  nome: "Maria Silva",
  whatsapp: "(11) 98765-4321",
  quantidade: 2,
  endereco: "Rua A, 10",
  precoEsperadoCentavos: 5000,
  chaveEnvio: "6f1c2a7e-3b4d-4e5f-8a9b-0c1d2e3f4a5b",
};

function erroDe(campo: string, dados: Record<string, unknown>) {
  const resultado = schemaReserva.safeParse({ ...valida, ...dados });
  if (resultado.success) return null;
  return resultado.error.issues.find((i) => i.path[0] === campo)?.message ?? null;
}

describe("schemaReserva", () => {
  it("aceita uma reserva válida e normaliza os dados", () => {
    const resultado = schemaReserva.parse({
      ...valida,
      nome: "  Maria Silva  ",
      endereco: "  Rua A, 10  ",
    });
    expect(resultado.nome).toBe("Maria Silva");
    expect(resultado.whatsapp).toBe("11987654321");
    expect(resultado.endereco).toBe("Rua A, 10");
  });

  it.each([
    ["a", "Informe seu nome."],
    ["   ", "Informe seu nome."],
    ["ab", null],
    ["a".repeat(80), null],
    ["a".repeat(81), "Use no máximo 80 caracteres."],
  ])("nome %j → %s", (nome, erro) => {
    expect(erroDe("nome", { nome })).toBe(erro);
  });

  it.each([
    ["98765-4321", "WhatsApp inválido. Informe DDD e número."],
    ["+55 11 98765-4321", null],
  ])("whatsapp %s → %s", (whatsapp, erro) => {
    expect(erroDe("whatsapp", { whatsapp })).toBe(erro);
  });

  it.each([
    [0, "Escolha de 1 a 10 peças."],
    [1, null],
    [10, null],
    [11, "Escolha de 1 a 10 peças."],
    [2.5, "Escolha de 1 a 10 peças."],
    [Number.NaN, "Escolha a quantidade."],
  ])("quantidade %s → %s", (quantidade, erro) => {
    expect(erroDe("quantidade", { quantidade })).toBe(erro);
  });

  it.each([
    ["a".repeat(200), null],
    ["a".repeat(201), "Use no máximo 200 caracteres."],
  ])("endereço com %#", (endereco, erro) => {
    expect(erroDe("endereco", { endereco })).toBe(erro);
  });

  it.each(["", "   ", null, undefined])("endereço %j vira null", (endereco) => {
    expect(schemaReserva.parse({ ...valida, endereco }).endereco).toBeNull();
  });

  it("exige chave de envio em formato UUID", () => {
    expect(erroDe("chaveEnvio", { chaveEnvio: "abc" })).not.toBeNull();
  });

  it("exige preço esperado positivo", () => {
    expect(erroDe("precoEsperadoCentavos", { precoEsperadoCentavos: 0 })).not.toBeNull();
  });
});

describe("schemaReservaFormulario", () => {
  const formulario = { nome: "Maria", whatsapp: "11987654321", endereco: "" };

  it("limita a quantidade ao disponível quando é menor que 10", () => {
    const schema = schemaReservaFormulario(3);
    expect(schema.safeParse({ ...formulario, quantidade: 3 }).success).toBe(true);
    const resultado = schema.safeParse({ ...formulario, quantidade: 4 });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].message).toBe("Escolha de 1 a 3 peças.");
  });

  it("mantém o limite de 10 quando há mais peças", () => {
    const schema = schemaReservaFormulario(50);
    expect(schema.safeParse({ ...formulario, quantidade: 10 }).success).toBe(true);
    expect(schema.safeParse({ ...formulario, quantidade: 11 }).success).toBe(false);
  });

  it("avisa quando só resta uma peça", () => {
    const resultado = schemaReservaFormulario(1).safeParse({ ...formulario, quantidade: 2 });
    expect(resultado.error?.issues[0].message).toBe("Só há 1 peça disponível.");
  });
});

describe("schemaFiltrosPainel", () => {
  it("sem parâmetros mostra só as ativas", () => {
    expect(schemaFiltrosPainel.parse({})).toEqual({
      codigo: undefined,
      pagamento: undefined,
      entrega: undefined,
      situacao: "ativas",
    });
  });

  it("normaliza o código digitado", () => {
    expect(schemaFiltrosPainel.parse({ codigo: " k7p 2xq " }).codigo).toBe("K7P2XQ");
  });

  it("código só com espaços vira busca vazia", () => {
    expect(schemaFiltrosPainel.parse({ codigo: "   " }).codigo).toBeUndefined();
  });

  it("combina pagamento, entrega e situação", () => {
    expect(
      schemaFiltrosPainel.parse({ pagamento: "pago", entrega: "pendente", situacao: "todas" }),
    ).toMatchObject({ pagamento: "pago", entrega: "pendente", situacao: "todas" });
  });

  it("ignora valores inválidos sem quebrar a página", () => {
    expect(
      schemaFiltrosPainel.parse({ pagamento: "talvez", entrega: 3, situacao: "apagadas" }),
    ).toMatchObject({ pagamento: undefined, entrega: undefined, situacao: "ativas" });
  });

  it("parâmetro repetido usa o primeiro valor", () => {
    expect(schemaFiltrosPainel.parse({ pagamento: ["pago", "pendente"] }).pagamento).toBe(
      "pago",
    );
  });
});

describe("status de pagamento e entrega", () => {
  const id = "6f1c2a7e-3b4d-4e5f-8a9b-0c1d2e3f4a5b";

  it("aceita os status conhecidos", () => {
    expect(schemaStatusPagamento.safeParse({ id, status: "pago" }).success).toBe(true);
    expect(schemaStatusEntrega.safeParse({ id, status: "entregue" }).success).toBe(true);
  });

  it("recusa status trocados e id inválido", () => {
    expect(schemaStatusPagamento.safeParse({ id, status: "entregue" }).success).toBe(false);
    expect(schemaStatusEntrega.safeParse({ id, status: "pago" }).success).toBe(false);
    expect(schemaStatusPagamento.safeParse({ id: "1", status: "pago" }).success).toBe(false);
  });
});
