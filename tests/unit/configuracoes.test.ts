import { describe, expect, it } from "vitest";
import {
  formatarQueijos,
  precisaConfigurar,
  resumoDaVenda,
  schemaTotalFormulario,
  situacaoPublica,
  textosDaAbertura,
  textoDoEstoque,
  valoresIniciais,
} from "@/components/configuracoes-venda/configuracoes-venda.model";
import type { ResumoPainelDTO } from "@/lib/tipos";

const resumo: ResumoPainelDTO = {
  recebidoCentavos: 0,
  aReceberCentavos: 0,
  precoCentavos: 4590,
  disponivel: 11,
  reservadas: 29,
  total: 40,
  reservasAbertas: true,
};

describe("valoresIniciais", () => {
  it("preenche preço e total com o que está salvo", () => {
    expect(valoresIniciais(resumo)).toEqual({
      preco: { preco: "45,90" },
      total: { total: "40" },
    });
  });

  it("preço ainda não definido deixa o campo vazio", () => {
    expect(valoresIniciais({ ...resumo, precoCentavos: 0 }).preco).toEqual({ preco: "" });
  });
});

describe("precisaConfigurar", () => {
  it.each([
    [{}, false],
    [{ precoCentavos: 0 }, true],
    [{ total: 0, disponivel: 0, reservadas: 0 }, true],
    [{ reservasAbertas: false }, false],
  ])("%j → %s", (mudanca, esperado) => {
    expect(precisaConfigurar({ ...resumo, ...mudanca })).toBe(esperado);
  });
});

describe("resumoDaVenda", () => {
  it("diz preço, total e abertura numa frase", () => {
    expect(resumoDaVenda(resumo)).toBe(
      "R$ 45,90 por peça, 40 queijos, aceitando reservas",
    );
  });

  it("diz a situação real da página, não só a chave", () => {
    expect(resumoDaVenda({ ...resumo, precoCentavos: 0, total: 1, reservasAbertas: false })).toBe(
      "Preço não definido, 1 queijo, reservas ainda não abertas",
    );
    expect(resumoDaVenda({ ...resumo, reservasAbertas: false })).toBe(
      "R$ 45,90 por peça, 40 queijos, reservas encerradas",
    );
    expect(resumoDaVenda({ ...resumo, total: 0, disponivel: 0, reservadas: 0 })).toBe(
      "R$ 45,90 por peça, nenhum queijo, reservas ainda não abertas",
    );
    expect(resumoDaVenda({ ...resumo, disponivel: 0, reservadas: 40 })).toBe(
      "R$ 45,90 por peça, 40 queijos, esgotado",
    );
  });

  it("total zero vira nenhum queijo", () => {
    expect(formatarQueijos(0)).toBe("nenhum queijo");
  });
});

describe("textoDoEstoque", () => {
  it("sem mudança, mostra o que está salvo", () => {
    expect(textoDoEstoque(29, 11, "40")).toBe("Reservadas: 29 · Disponíveis: 11");
  });

  it("antecipa o disponível do total digitado", () => {
    expect(textoDoEstoque(29, 11, "50")).toBe(
      "Reservadas: 29 · Disponíveis: 21 depois de salvar",
    );
    expect(textoDoEstoque(29, 11, " 29 ")).toBe(
      "Reservadas: 29 · Disponíveis: 0 depois de salvar",
    );
  });

  it.each(["", "abc", "4,5", "10"])(
    "total %j inválido ou abaixo do reservado mantém o salvo",
    (digitado) => {
      expect(textoDoEstoque(29, 11, digitado)).toBe("Reservadas: 29 · Disponíveis: 11");
    },
  );
});

describe("situacaoPublica", () => {
  it.each([
    [{}, true, "aberta"],
    [{ precoCentavos: 0 }, true, "sem_preco"],
    [{ precoCentavos: 0 }, false, "sem_preco"],
    [{}, false, "encerrada"],
    [{ total: 0, disponivel: 0, reservadas: 0 }, false, "encerrada"],
    [{ total: 0, disponivel: 0, reservadas: 0 }, true, "sem_queijos"],
    [{ disponivel: 0, reservadas: 40 }, true, "esgotada"],
  ] as const)("%j com chave %s → %s", (mudanca, abertas, esperada) => {
    expect(situacaoPublica({ ...resumo, ...mudanca }, abertas)).toBe(esperada);
  });
});

describe("textosDaAbertura", () => {
  it("vendendo: tinta cheia e o formulário na página", () => {
    expect(textosDaAbertura(resumo, true)).toEqual({
      estado: "Aceitando reservas",
      ajuda: "A página pública mostra o formulário de reserva.",
      vendendo: true,
    });
  });

  it("sem preço, não diz que está aceitando mesmo com a chave ligada", () => {
    expect(textosDaAbertura({ ...resumo, precoCentavos: 0 }, true)).toEqual({
      estado: "Abre quando houver preço",
      ajuda: "A página só abre as reservas depois que o preço for definido.",
      vendendo: false,
    });
  });

  it("sem queijos e esgotado dizem o próximo passo", () => {
    expect(textosDaAbertura({ ...resumo, total: 0, disponivel: 0, reservadas: 0 }, true).estado).toBe(
      "Abre quando houver queijos",
    );
    expect(textosDaAbertura({ ...resumo, disponivel: 0, reservadas: 40 }, true).ajuda).toMatch(
      /Aumente o total para voltar a vender\.$/,
    );
  });

  it("encerradas", () => {
    expect(textosDaAbertura(resumo, false)).toMatchObject({
      estado: "Reservas encerradas",
      vendendo: false,
    });
  });
});

describe("schemaTotalFormulario", () => {
  function erroDoTotal(total: string) {
    const resultado = schemaTotalFormulario.safeParse({ total });
    return resultado.success ? null : resultado.error.issues[0].message;
  }

  it("transforma o texto em número", () => {
    expect(schemaTotalFormulario.parse({ total: " 60 " })).toEqual({ total: 60 });
    expect(schemaTotalFormulario.parse({ total: "0" })).toEqual({ total: 0 });
  });

  it.each([
    ["", "Informe o total de queijos."],
    ["   ", "Informe o total de queijos."],
    ["4,5", "Use só números, sem vírgula nem ponto."],
    ["1.000", "Use só números, sem vírgula nem ponto."],
    ["-3", "Use só números, sem vírgula nem ponto."],
    ["vinte", "Use só números, sem vírgula nem ponto."],
    ["99999999999", "Total alto demais. Confira o número."],
  ])("%j → %s", (total, erro) => {
    expect(erroDoTotal(total)).toBe(erro);
  });
});
