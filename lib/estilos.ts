// Campo em caixa, grande o bastante para qualquer pessoa tocar e ler (DESIGN.md).
export const CAMPO =
  "h-12 rounded-lg bg-card px-3.5 text-base md:text-base shadow-xs transition-[border-color,box-shadow] duration-150";

// Colunas da lista de reservas no desktop: reserva, total, pagamento, entrega, detalhes.
// O cabeçalho da lista e cada linha usam a mesma grade.
export const COLUNAS_RESERVA = "md:grid-cols-[minmax(0,1fr)_8rem_9rem_10rem_2.75rem]";

// Stepper de quantidade (DESIGN.md): uma caixa só, do tamanho dos botões, e o
// foco do número acende a caixa inteira. Usado no formulário público e no painel.
export const STEPPER_CAIXA =
  "flex w-fit items-stretch rounded-lg border border-input bg-card shadow-xs has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 has-[input[aria-invalid=true]]:border-destructive";
export const STEPPER_NUMERO =
  "h-12 w-16 rounded-none border-0 border-x border-border bg-transparent text-center text-lg font-semibold tabular-nums shadow-none focus-visible:ring-0 aria-invalid:ring-0 md:text-lg dark:bg-transparent";

// Diálogos do painel: título em Title, texto em Body e botões de 48 px. Em tela
// baixa ou com o teclado aberto, o diálogo rola por dentro em vez de cortar.
export const DIALOGO = "max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-4 sm:max-w-md sm:p-6";
export const DIALOGO_TITULO = "text-lg leading-snug font-semibold tracking-tight text-pretty";
export const DIALOGO_TEXTO = "text-base leading-snug text-pretty text-muted-foreground";
export const DIALOGO_RODAPE = "sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-4";
export const DIALOGO_BOTAO = "h-12 px-5 text-base";
