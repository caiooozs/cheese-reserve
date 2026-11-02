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

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function partesSaoPaulo(iso: string) {
  return Object.fromEntries(
    dataHora.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
}

// "15:02", no horário de Brasília.
export function formatarHora(iso: string) {
  const partes = partesSaoPaulo(iso);
  return `${partes.hour}:${partes.minute}`;
}

// "2026-11-02": o dia em Brasília, para agrupar e comparar.
export function diaDe(iso: string) {
  const partes = partesSaoPaulo(iso);
  return `${partes.year}-${partes.month}-${partes.day}`;
}

function diaAnterior(dia: string) {
  // Meio-dia em UTC: subtrair 24 h nunca pula de dia por causa de fuso.
  const data = new Date(`${dia}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() - 1);
  return data.toISOString().slice(0, 10);
}

// "Hoje", "Ontem" ou "31 de outubro".
export function rotuloDoDia(dia: string, hoje: string) {
  if (dia === hoje) return "Hoje";
  if (dia === diaAnterior(hoje)) return "Ontem";
  const [, mes, numero] = dia.split("-").map(Number);
  return `${numero} de ${MESES[mes - 1]}`;
}
