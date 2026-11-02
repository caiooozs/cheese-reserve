import { describe, expect, it } from "vitest";
import {
  diaDe,
  formatarDataHora,
  formatarHora,
  formatarPecas,
  formatarReais,
  rotuloDoDia,
} from "@/lib/formatacao";

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

describe("formatarHora", () => {
  it("mostra hora e minuto em Brasília", () => {
    expect(formatarHora("2026-10-29T18:02:00Z")).toBe("15:02");
  });

  it("usa 00 para meia-noite", () => {
    expect(formatarHora("2026-11-02T03:00:00Z")).toBe("00:00");
  });
});

describe("diaDe", () => {
  it("usa o dia de Brasília, não o de UTC", () => {
    // 01:30 em UTC do dia 2 ainda é 22:30 do dia 1 em Brasília.
    expect(diaDe("2026-11-02T01:30:00Z")).toBe("2026-11-01");
    expect(diaDe("2026-11-02T03:00:00Z")).toBe("2026-11-02");
  });
});

describe("rotuloDoDia", () => {
  it("chama o dia atual de Hoje e o anterior de Ontem", () => {
    expect(rotuloDoDia("2026-11-02", "2026-11-02")).toBe("Hoje");
    expect(rotuloDoDia("2026-11-01", "2026-11-02")).toBe("Ontem");
  });

  it("reconhece Ontem na virada do mês e do ano", () => {
    expect(rotuloDoDia("2026-10-31", "2026-11-01")).toBe("Ontem");
    expect(rotuloDoDia("2026-12-31", "2027-01-01")).toBe("Ontem");
  });

  it("escreve os outros dias por extenso", () => {
    expect(rotuloDoDia("2026-10-30", "2026-11-02")).toBe("30 de outubro");
    expect(rotuloDoDia("2026-03-05", "2026-11-02")).toBe("5 de março");
  });
});
