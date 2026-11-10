import { describe, expect, it } from "vitest";
import { textosDoCancelamento } from "@/components/dialogo-cancelar/dialogo-cancelar.model";
import { valoresIniciais } from "@/components/dialogo-dados-cliente/dialogo-dados-cliente.model";
import {
  precoDaReserva,
  previaDaQuantidade,
  schemaQuantidadeDialogo,
  textoDoLimite,
} from "@/components/dialogo-quantidade/dialogo-quantidade.model";
import type { ReservaPainelDTO } from "@/lib/tipos";

const reserva: ReservaPainelDTO = {
  id: "6f1c2a7e-3b4d-4e5f-8a9b-0c1d2e3f4a5b",
  codigo: "K7P2XQ",
  nome: "Heloísa Prado",
  whatsapp: "11987654321",
  endereco: null,
  quantidade: 2,
  valorTotalCentavos: 9180,
  criadaEm: "2026-11-10T11:49:00.000Z",
  statusPagamento: "pendente",
  statusEntrega: "pendente",
  cancelada: false,
};

describe("precoDaReserva", () => {
  it("volta ao preço fixado na criação", () => {
    expect(precoDaReserva(reserva)).toBe(4590);
    expect(precoDaReserva({ quantidade: 12, valorTotalCentavos: 12 * 5099 })).toBe(5099);
  });
});

describe("schemaQuantidadeDialogo", () => {
  const erro = (atual: number, disponivel: number, quantidade: number) => {
    const r = schemaQuantidadeDialogo(atual, disponivel).safeParse({ quantidade });
    return r.success ? null : r.error.issues[0].message;
  };

  it("vai até o que a reserva tem mais o disponível", () => {
    expect(erro(2, 5, 7)).toBeNull();
    expect(erro(2, 5, 8)).toBe("Há 5 peças disponíveis: o máximo para esta reserva é 7 peças.");
    expect(erro(2, 1, 4)).toBe("Há 1 peça disponível: o máximo para esta reserva é 3 peças.");
  });

  it("sem disponível, só diminui", () => {
    expect(erro(4, 0, 1)).toBeNull();
    expect(erro(4, 0, 5)).toBe("Não há peças disponíveis agora: dá só para diminuir.");
  });

  it("aceita mais de 10 quando há estoque", () => {
    expect(erro(2, 20, 12)).toBeNull();
  });

  it("mínimo de 1 peça", () => {
    expect(erro(2, 5, 0)).toBe(
      "A quantidade mínima é 1 peça. Para desistir, cancele a reserva.",
    );
  });
});

describe("textoDoLimite", () => {
  it.each([
    [2, 5, "Até 7 peças: 2 desta reserva e mais 5 disponíveis."],
    [1, 1, "Até 2 peças: 1 desta reserva e mais 1 disponível."],
    [4, 0, "Não há peças disponíveis agora: dá só para diminuir."],
  ])("atual %i, disponível %i", (atual, disponivel, texto) => {
    expect(textoDoLimite(atual, disponivel)).toBe(texto);
  });
});

describe("previaDaQuantidade", () => {
  it("mostra conta, total e o efeito no estoque", () => {
    expect(previaDaQuantidade(2, 4, 4590)).toEqual({
      titulo: "Novo total",
      conta: "4 peças × R$ 45,90",
      total: "R$ 183,60",
      efeito: "Saem mais 2 peças do estoque.",
    });
    expect(previaDaQuantidade(4, 1, 4590)?.efeito).toBe("Voltam 3 peças para o estoque.");
    expect(previaDaQuantidade(2, 2, 4590)).toMatchObject({
      titulo: "Total atual",
      efeito: "Mude a quantidade para ver o novo total.",
    });
    expect(previaDaQuantidade(2, 3, 4590)?.efeito).toBe("Saem mais 1 peça do estoque.");
  });

  it.each([Number.NaN, 0, 1.5])("sem prévia para %s", (nova) => {
    expect(previaDaQuantidade(2, nova, 4590)).toBeNull();
  });
});

describe("textosDoCancelamento", () => {
  it("pergunta com código, nome e peças", () => {
    expect(textosDoCancelamento(reserva, false)).toEqual({
      pergunta: "Cancelar a reserva K7P2XQ de Heloísa Prado (2 peças)?",
      consequencia: "As peças voltam para o estoque. Isso não pode ser desfeito.",
      devolucao: null,
    });
  });

  it("paga: lembra de devolver o valor", () => {
    expect(textosDoCancelamento(reserva, true).devolucao).toBe(
      "Esta reserva já foi paga. Devolva R$ 91,80 para Heloísa Prado.",
    );
  });
});

describe("valoresIniciais dos dados do cliente", () => {
  it("WhatsApp com máscara e endereço vazio no lugar de null", () => {
    expect(valoresIniciais(reserva)).toEqual({
      nome: "Heloísa Prado",
      whatsapp: "(11) 98765-4321",
      endereco: "",
    });
    expect(valoresIniciais({ ...reserva, endereco: "Rua A, 1" }).endereco).toBe("Rua A, 1");
  });
});
