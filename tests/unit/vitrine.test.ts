import { describe, expect, it } from "vitest";
import {
  estadoDaVitrine,
  quantidadeMaxima,
} from "@/components/formulario-reserva/formulario-reserva.model";

const aberta = { precoCentavos: 5000, disponivel: 20, reservasAbertas: true };

describe("estadoDaVitrine", () => {
  it.each([
    ["aberta", aberta, "aberta"],
    ["sem preço", { ...aberta, precoCentavos: 0 }, "nao_abriu"],
    ["encerrada", { ...aberta, reservasAbertas: false }, "encerrada"],
    ["sem peças", { ...aberta, disponivel: 0 }, "esgotada"],
    [
      "sem preço e encerrada",
      { ...aberta, precoCentavos: 0, reservasAbertas: false },
      "nao_abriu",
    ],
    ["sem preço e sem peças", { ...aberta, precoCentavos: 0, disponivel: 0 }, "nao_abriu"],
    [
      "encerrada e sem peças",
      { ...aberta, reservasAbertas: false, disponivel: 0 },
      "encerrada",
    ],
  ])("%s", (_, vitrine, esperado) => {
    expect(estadoDaVitrine(vitrine)).toBe(esperado);
  });
});

describe("quantidadeMaxima", () => {
  it("é o limite por reserva quando há peças de sobra", () => {
    expect(quantidadeMaxima(aberta)).toBe(10);
  });

  it("é o disponível quando restam menos que o limite", () => {
    expect(quantidadeMaxima({ ...aberta, disponivel: 3 })).toBe(3);
  });
});
