// Códigos de erro do banco → mensagens para quem usa o app.
const MENSAGENS: Record<string, string> = {
  quantidade_invalida: "Escolha uma quantidade válida.",
  venda_fechada: "As reservas ainda não abriram.",
  reservas_encerradas: "As reservas foram encerradas.",
  preco_alterado:
    "O preço mudou enquanto você preenchia. Confira o novo valor e confirme de novo.",
  estoque_insuficiente:
    "Não há peças suficientes. Veja quantas ainda estão disponíveis.",
  codigo_indisponivel:
    "Não foi possível concluir agora. Tente de novo em instantes.",
  dados_invalidos: "Confira os dados preenchidos.",
  reserva_nao_encontrada: "Reserva não encontrada.",
  reserva_cancelada: "Esta reserva foi cancelada e não pode ser alterada.",
  reserva_paga:
    "Esta reserva já está paga. Para mudar a quantidade, marque o pagamento como pendente antes.",
  estoque_abaixo_do_reservado:
    "O total não pode ser menor que as {n} peças já reservadas.",
  nao_autorizado: "Sua sessão expirou. Entre de novo.",
  credenciais_invalidas: "E-mail ou senha incorretos.",
};

export const MENSAGEM_GENERICA = "Algo deu errado. Tente de novo em instantes.";

export function erroDeRegra(codigo: string | null | undefined) {
  return Boolean(codigo) && Object.hasOwn(MENSAGENS, codigo as string);
}

export function traduzirErro(codigo: string | null | undefined, n?: number) {
  if (!codigo || !erroDeRegra(codigo)) {
    return MENSAGEM_GENERICA;
  }
  const mensagem = MENSAGENS[codigo];
  return n === undefined
    ? mensagem.replace(" {n}", "")
    : mensagem.replace("{n}", String(n));
}
