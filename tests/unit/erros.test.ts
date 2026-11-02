import { describe, expect, it } from "vitest";
import { erroDeRegra, MENSAGEM_GENERICA, traduzirErro } from "@/lib/erros";

describe("erroDeRegra", () => {
  it("reconhece códigos de regra", () => {
    expect(erroDeRegra("estoque_insuficiente")).toBe(true);
  });

  it.each(["fetch failed", "constructor", "", null, undefined])(
    "não reconhece %s",
    (codigo) => {
      expect(erroDeRegra(codigo)).toBe(false);
    },
  );
});

describe("traduzirErro", () => {
  it.each([
    ["quantidade_invalida", "Escolha uma quantidade válida."],
    ["venda_fechada", "As reservas ainda não abriram."],
    ["reservas_encerradas", "As reservas foram encerradas."],
    [
      "preco_alterado",
      "O preço mudou enquanto você preenchia. Confira o novo valor e confirme de novo.",
    ],
    [
      "estoque_insuficiente",
      "Não há peças suficientes. Veja quantas ainda estão disponíveis.",
    ],
    [
      "codigo_indisponivel",
      "Não foi possível concluir agora. Tente de novo em instantes.",
    ],
    ["dados_invalidos", "Confira os dados preenchidos."],
    ["reserva_nao_encontrada", "Reserva não encontrada."],
    ["reserva_cancelada", "Esta reserva foi cancelada e não pode ser alterada."],
    [
      "reserva_paga",
      "Esta reserva já está paga. Para mudar a quantidade, marque o pagamento como pendente antes.",
    ],
    ["nao_autorizado", "Sua sessão expirou. Entre de novo."],
    ["credenciais_invalidas", "E-mail ou senha incorretos. Confira e tente de novo."],
    ["sem_acesso", "Esta conta não tem acesso ao painel."],
  ])("%s", (codigo, mensagem) => {
    expect(traduzirErro(codigo)).toBe(mensagem);
  });

  it("inclui o número de peças reservadas quando informado", () => {
    expect(traduzirErro("estoque_abaixo_do_reservado", 42)).toBe(
      "O total não pode ser menor que as 42 peças já reservadas.",
    );
  });

  it("omite o número quando não informado", () => {
    expect(traduzirErro("estoque_abaixo_do_reservado")).toBe(
      "O total não pode ser menor que as peças já reservadas.",
    );
  });

  it.each([
    "new row violates check constraint",
    "constructor",
    "",
    null,
    undefined,
  ])("usa a mensagem genérica para %s", (codigo) => {
    expect(traduzirErro(codigo)).toBe(MENSAGEM_GENERICA);
  });
});
