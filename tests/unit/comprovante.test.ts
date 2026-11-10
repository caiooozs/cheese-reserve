import { describe, expect, it } from "vitest";
import { textoComprovante } from "@/components/comprovante/comprovante.model";
import type { ComprovanteDTO } from "@/lib/tipos";

const comprovante: ComprovanteDTO = {
  codigo: "K7M2QX",
  nome: "Maria Silva",
  quantidade: 2,
  valorTotalCentavos: 10000,
  endereco: "Rua A, 10",
  criadaEm: "2026-10-29T18:02:00Z",
};

describe("textoComprovante", () => {
  it("monta o texto completo com endereço", () => {
    expect(textoComprovante(comprovante).split("\n")).toEqual([
      "Reserva de queijo K7M2QX",
      "Nome: Maria Silva",
      "Quantidade: 2 peças",
      "Total: R$ 100,00",
      "Entrega: Rua A, 10",
      "Feita em 29/10/2026 às 15:02",
    ]);
  });

  it("omite a linha de entrega sem endereço", () => {
    expect(textoComprovante({ ...comprovante, endereco: null }).split("\n")).toEqual([
      "Reserva de queijo K7M2QX",
      "Nome: Maria Silva",
      "Quantidade: 2 peças",
      "Total: R$ 100,00",
      "Feita em 29/10/2026 às 15:02",
    ]);
  });

  it("usa o singular para 1 peça", () => {
    expect(textoComprovante({ ...comprovante, quantidade: 1 })).toContain(
      "Quantidade: 1 peça\n",
    );
  });
});
