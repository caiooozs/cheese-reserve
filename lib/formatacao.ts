const reais = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// Centavos viram reais só aqui, na exibição.
export function formatarReais(centavos: number) {
  return reais.format(centavos / 100);
}

export function formatarPecas(quantidade: number) {
  return quantidade === 1 ? "1 peça" : `${quantidade} peças`;
}

// "29/10/2026 às 15:02", no horário de Brasília.
export function formatarDataHora(iso: string) {
  const partes = Object.fromEntries(
    dataHora.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return `${partes.day}/${partes.month}/${partes.year} às ${partes.hour}:${partes.minute}`;
}
