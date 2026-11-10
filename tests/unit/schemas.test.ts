import { describe, expect, it } from "vitest";
import { schemaReservaFormulario } from "@/components/formulario-reserva/formulario-reserva.model";
import {
  schemaAbertura,
  schemaAlterarQuantidade,
  schemaCorrigirDados,
  schemaIdReserva,
  schemaEstoqueTotal,
  schemaFiltrosPainel,
  schemaPreco,
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

describe("schemaPreco", () => {
  function erroDoPreco(preco: string) {
    const resultado = schemaPreco.safeParse({ preco });
    return resultado.success ? null : resultado.error.issues[0].message;
  }

  it.each([
    ["45,90", 4590],
    [" R$ 50 ", 5000],
    ["1.234,56", 123456],
  ])("%j vira %i centavos", (preco, centavos) => {
    expect(schemaPreco.parse({ preco })).toEqual({ preco: centavos });
  });

  it.each([
    ["", "Informe o preço por peça."],
    ["   ", "Informe o preço por peça."],
    ["0", "Informe um preço maior que zero."],
    ["0,00", "Informe um preço maior que zero."],
    ["-10", "Use só números, com vírgula nos centavos. Exemplo: 45,90"],
    ["dez reais", "Use só números, com vírgula nos centavos. Exemplo: 45,90"],
    ["45,901", "Use só números, com vírgula nos centavos. Exemplo: 45,90"],
    ["21.474.836,48", "Preço alto demais. Confira o valor."],
  ])("%j → %s", (preco, erro) => {
    expect(erroDoPreco(preco)).toBe(erro);
  });

  it("recusa preço que não chega como texto", () => {
    expect(schemaPreco.safeParse({ preco: 4590 }).success).toBe(false);
  });
});

describe("schemaEstoqueTotal", () => {
  it.each([0, 1, 60])("aceita %i", (total) => {
    expect(schemaEstoqueTotal.safeParse({ total }).success).toBe(true);
  });

  it.each([
    [-1, "O total não pode ser negativo."],
    [2.5, "Use um número inteiro de queijos."],
    [Number.NaN, "Informe o total de queijos."],
    ["30", "Informe o total de queijos."],
    [2_147_483_648, "Total alto demais. Confira o número."],
  ])("%j → %s", (total, erro) => {
    const resultado = schemaEstoqueTotal.safeParse({ total });
    expect(resultado.error?.issues[0].message).toBe(erro);
  });
});

describe("schemaAbertura", () => {
  it("aceita só verdadeiro ou falso", () => {
    expect(schemaAbertura.safeParse({ abertas: true }).success).toBe(true);
    expect(schemaAbertura.safeParse({ abertas: false }).success).toBe(true);
    expect(schemaAbertura.safeParse({ abertas: "false" }).success).toBe(false);
    expect(schemaAbertura.safeParse({}).success).toBe(false);
  });
});

describe("correções de reserva", () => {
  const id = "6f1c2a7e-3b4d-4e5f-8a9b-0c1d2e3f4a5b";

  it("id precisa ser UUID", () => {
    expect(schemaIdReserva.safeParse({ id }).success).toBe(true);
    expect(schemaIdReserva.safeParse({ id: "abc" }).success).toBe(false);
  });

  it.each([1, 10, 12, 50])("aceita %i peças, sem o limite público", (quantidade) => {
    expect(schemaAlterarQuantidade.safeParse({ id, quantidade }).success).toBe(true);
  });

  it.each([
    [0, "A quantidade mínima é 1 peça. Para desistir, cancele a reserva."],
    [-2, "A quantidade mínima é 1 peça. Para desistir, cancele a reserva."],
    [1.5, "Use um número inteiro de peças."],
    [Number.NaN, "Escolha a quantidade."],
    [2_147_483_648, "Quantidade alta demais. Confira o número."],
  ])("quantidade %s → %s", (quantidade, erro) => {
    const resultado = schemaAlterarQuantidade.safeParse({ id, quantidade });
    expect(resultado.error?.issues[0].message).toBe(erro);
  });

  it("corrige dados com as regras do formulário público", () => {
    expect(
      schemaCorrigirDados.parse({
        id,
        nome: "  Joana Lima ",
        whatsapp: "(21) 99887-7665",
        endereco: "  ",
      }),
    ).toEqual({ id, nome: "Joana Lima", whatsapp: "21998877665", endereco: null });
  });

  it("recusa nome curto e WhatsApp sem DDD", () => {
    const resultado = schemaCorrigirDados.safeParse({
      id,
      nome: "J",
      whatsapp: "98765-4321",
      endereco: "",
    });
    const mensagens = Object.fromEntries(
      resultado.error!.issues.map((i) => [String(i.path[0]), i.message]),
    );
    expect(mensagens).toEqual({
      nome: "Informe o nome do cliente.",
      whatsapp: "WhatsApp inválido. Informe DDD e número.",
    });
  });
});
