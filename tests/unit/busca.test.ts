import { describe, expect, it } from "vitest";
import { combinaComBusca, limparBusca } from "@/lib/busca";

const heloisa = { nome: "Heloísa Prado", codigo: "K7P2XQ" };

describe("combinaComBusca", () => {
  it.each([
    "Heloísa",
    "heloisa",
    "HELOISA",
    "helo",
    "prado",
    "helo prado",
    "prado helo",
    "  heloisa   prado  ",
    "K7P2XQ",
    "k7p2xq",
    "k7p",
    "k7p 2xq",
    "helo k7p",
    "",
  ])("acha a reserva com %j", (busca) => {
    expect(combinaComBusca(heloisa, busca)).toBe(true);
  });

  it.each(["maria", "helo maria", "ZZZ", "k7p9"])("não acha com %j", (busca) => {
    expect(combinaComBusca(heloisa, busca)).toBe(false);
  });

  it("ignora o acento de quem digita também", () => {
    expect(combinaComBusca({ nome: "Joao Silva", codigo: "AAAAA2" }, "joão")).toBe(true);
    expect(combinaComBusca({ nome: "Conceição", codigo: "AAAAA2" }, "conceicao")).toBe(true);
  });
});

describe("limparBusca", () => {
  it("tira espaços sobrando e mantém o texto digitado", () => {
    expect(limparBusca("  Heloísa   Prado ")).toBe("Heloísa Prado");
    expect(limparBusca("   ")).toBe("");
  });
});
