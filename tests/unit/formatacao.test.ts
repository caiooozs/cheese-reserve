import { describe, expect, it } from "vitest";
import { formatarDataHora, formatarPecas, formatarReais } from "@/lib/formatacao";

describe("formatarPecas", () => {
  it.each([
    [1, "1 peça"],
    [2, "2 peças"],
    [0, "0 peças"],
  ])("%i → %s", (quantidade, esperado) => {
    expect(formatarPecas(quantidade)).toBe(esperado);
  });
});

describe("formatarReais", () => {
  it.each([
    [10000, "R$ 100,00"],
    [4590, "R$ 45,90"],
    [123456, "R$ 1.234,56"],
    [5, "R$ 0,05"],
    [0, "R$ 0,00"],
  ])("%i centavos → %s", (centavos, esperado) => {
    expect(formatarReais(centavos)).toBe(esperado);
  });
});

describe("formatarDataHora", () => {
  it("usa o horário de Brasília", () => {
    expect(formatarDataHora("2026-10-29T18:02:00Z")).toBe("29/10/2026 às 15:02");
  });

  it("mostra o dia anterior quando ainda não virou o dia em Brasília", () => {
    expect(formatarDataHora("2026-12-25T02:30:00Z")).toBe("24/12/2026 às 23:30");
  });

  it("usa 00 para meia-noite", () => {
    expect(formatarDataHora("2026-12-31T03:05:00Z")).toBe("31/12/2026 às 00:05");
  });
});
