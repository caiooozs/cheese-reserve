import { describe, expect, it } from "vitest";
import { centavosParaCampo, reaisParaCentavos } from "@/lib/dinheiro";

describe("reaisParaCentavos", () => {
  it.each([
    ["45,90", 4590],
    ["45,9", 4590],
    ["45,09", 4509],
    ["45", 4500],
    ["0,50", 50],
    ["0", 0],
    ["1.234,56", 123456],
    ["1.234", 123400],
    ["1.234.567,89", 123456789],
    ["R$ 10,00", 1000],
    ["R$10,00", 1000],
    ["r$ 10", 1000],
    ["R$ 50,00", 5000], // espaço não separável, como sai do Intl
    ["  45,90  ", 4590],
    ["45.90", 4590],
    ["45.9", 4590],
    ["0045,90", 4590],
  ])("%j → %i", (texto, centavos) => {
    expect(reaisParaCentavos(texto)).toBe(centavos);
  });

  it.each([
    "",
    "   ",
    "-45,90",
    "-45",
    "abc",
    "45,9a",
    "45a",
    "45,901",
    "4.5901,10", // grupo de milhar fora do padrão
    "1.23,45",
    "12.34.56",
    "45,",
    ",90",
    "45,90,10",
    "1e3",
    "R$",
    "R$ -10",
    "99999999999999999999", // além do inteiro seguro
  ])("recusa %j", (texto) => {
    expect(reaisParaCentavos(texto)).toBeNull();
  });
});

describe("centavosParaCampo", () => {
  it.each([
    [4590, "45,90"],
    [4500, "45,00"],
    [5, "0,05"],
    [0, "0,00"],
    [123456, "1234,56"],
  ])("%i → %j", (centavos, texto) => {
    expect(centavosParaCampo(centavos)).toBe(texto);
  });

  it("volta ao mesmo valor ao converter de novo", () => {
    for (const centavos of [1, 99, 100, 4590, 123456]) {
      expect(reaisParaCentavos(centavosParaCampo(centavos))).toBe(centavos);
    }
  });
});
