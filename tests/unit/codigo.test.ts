import { describe, expect, it } from "vitest";
import { normalizarCodigoBusca } from "@/lib/codigo";

describe("normalizarCodigoBusca", () => {
  it("tira espaços e passa para maiúsculas", () => {
    expect(normalizarCodigoBusca(" k7p 2xq ")).toBe("K7P2XQ");
  });

  it("aceita quebra de linha e tabulação coladas do WhatsApp", () => {
    expect(normalizarCodigoBusca("K7P\t2XQ\n")).toBe("K7P2XQ");
  });

  it("mantém o código já normalizado", () => {
    expect(normalizarCodigoBusca("K7P2XQ")).toBe("K7P2XQ");
  });

  it("devolve vazio para texto só com espaços", () => {
    expect(normalizarCodigoBusca("   ")).toBe("");
  });
});
