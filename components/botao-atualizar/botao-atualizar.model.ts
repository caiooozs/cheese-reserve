export type BotaoAtualizarViewProps = {
  dados: { atualizando: boolean; aviso: string };
  acoes: { atualizar: () => void };
};
