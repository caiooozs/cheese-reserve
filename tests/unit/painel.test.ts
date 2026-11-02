import { describe, expect, it } from "vitest";
import { urlDosFiltros } from "@/components/busca-filtros/busca-filtros.model";
import { contarFiltros, estaFiltrando, rotuloLimpar } from "@/lib/filtros";
import { textosDaReserva } from "@/components/linha-reserva/linha-reserva.model";
import {
  agruparPorDia,
  contarEncontradas,
} from "@/components/lista-reservas/lista-reservas.model";
import type { ReservaPainelDTO } from "@/lib/tipos";

function reserva(parciais: Partial<ReservaPainelDTO> = {}): ReservaPainelDTO {
  return {
    id: crypto.randomUUID(),
    codigo: "K7P2XQ",
    nome: "Ana Souza",
    whatsapp: "11987654321",
    endereco: null,
    quantidade: 2,
    valorTotalCentavos: 10000,
    criadaEm: "2026-11-02T18:02:00Z",
    statusPagamento: "pendente",
    statusEntrega: "pendente",
    cancelada: false,
    ...parciais,
  };
}

describe("urlDosFiltros", () => {
  it("sem filtros volta para /admin", () => {
    expect(urlDosFiltros({})).toBe("/admin");
    expect(urlDosFiltros({ situacao: "ativas" })).toBe("/admin");
  });

  it("leva só o que foge do padrão", () => {
    expect(
      urlDosFiltros({ pagamento: "pago", entrega: "pendente", situacao: "ativas" }),
    ).toBe("/admin?pagamento=pago&entrega=pendente");
    expect(urlDosFiltros({ situacao: "canceladas" })).toBe("/admin?situacao=canceladas");
  });

  it("leva o código da busca", () => {
    expect(urlDosFiltros({ codigo: "K7P2XQ" })).toBe("/admin?codigo=K7P2XQ");
  });
});

describe("contarFiltros", () => {
  it("não conta a situação padrão nem o código", () => {
    expect(contarFiltros({ situacao: "ativas", codigo: "K7P2XQ" })).toBe(0);
  });

  it("conta pagamento, entrega e situação diferente de ativas", () => {
    expect(
      contarFiltros({
        codigo: undefined,
        pagamento: "pago",
        entrega: "pendente",
        situacao: "todas",
      }),
    ).toBe(3);
  });
});

describe("rotuloLimpar e estaFiltrando", () => {
  const padrao = { codigo: undefined, situacao: "ativas" } as const;

  it("sem busca nem filtro não está filtrando", () => {
    expect(estaFiltrando(padrao)).toBe(false);
  });

  it("nomeia o que vai limpar", () => {
    expect(rotuloLimpar({ ...padrao, codigo: "K7P2XQ" })).toBe("Limpar busca");
    expect(rotuloLimpar({ ...padrao, pagamento: "pago" })).toBe("Limpar filtros");
    expect(rotuloLimpar({ ...padrao, codigo: "K7P2XQ", situacao: "todas" })).toBe(
      "Limpar busca e filtros",
    );
  });
});

describe("agruparPorDia", () => {
  const hoje = "2026-11-02";

  it("junta as reservas do mesmo dia de Brasília, mantendo a ordem", () => {
    const lista = [
      reserva({ codigo: "AAAAA2", criadaEm: "2026-11-02T20:00:00Z" }),
      reserva({ codigo: "BBBBB3", criadaEm: "2026-11-02T03:10:00Z" }),
      // 01:30 em UTC do dia 2 ainda é dia 1 em Brasília.
      reserva({ codigo: "CCCCC4", criadaEm: "2026-11-02T01:30:00Z" }),
      reserva({ codigo: "DDDDD5", criadaEm: "2026-10-30T15:00:00Z" }),
    ];

    const dias = agruparPorDia(lista, hoje);

    expect(dias.map((d) => [d.rotulo, d.contagem])).toEqual([
      ["Hoje", "2 reservas"],
      ["Ontem", "1 reserva"],
      ["30 de outubro", "1 reserva"],
    ]);
    expect(dias[0].reservas.map((r) => r.codigo)).toEqual(["AAAAA2", "BBBBB3"]);
  });

  it("lista vazia não tem dias", () => {
    expect(agruparPorDia([], hoje)).toEqual([]);
  });
});

describe("contarEncontradas", () => {
  it("usa singular e plural", () => {
    expect(contarEncontradas(1)).toBe("1 reserva encontrada");
    expect(contarEncontradas(3)).toBe("3 reservas encontradas");
  });
});

describe("textosDaReserva", () => {
  it("formata valores, WhatsApp e horário de Brasília", () => {
    expect(textosDaReserva(reserva())).toEqual({
      codigo: "K7P2XQ",
      nome: "Ana Souza",
      total: "R$ 100,00",
      resumo: "2 peças, às 15:02",
      whatsapp: "(11) 98765-4321",
      linkWhatsApp: "https://wa.me/5511987654321",
      entrega: "A combinar pelo WhatsApp",
      feitaEm: "02/11/2026 às 15:02",
    });
  });

  it("mostra o endereço quando informado", () => {
    expect(textosDaReserva(reserva({ endereco: "Rua das Flores, 10" })).entrega).toBe(
      "Rua das Flores, 10",
    );
  });
});
