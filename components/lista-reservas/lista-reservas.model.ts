import { diaDe, rotuloDoDia } from "@/lib/formatacao";
import type { ReservaPainelDTO } from "@/lib/tipos";

export type DiaDoDiario = {
  dia: string;
  rotulo: string;
  contagem: string;
  reservas: ReservaPainelDTO[];
};

function contarReservas(quantidade: number) {
  return quantidade === 1 ? "1 reserva" : `${quantidade} reservas`;
}

// As reservas já chegam das mais recentes para as mais antigas;
// cada dia de Brasília vira uma página do diário, na mesma ordem.
export function agruparPorDia(reservas: ReservaPainelDTO[], hoje: string): DiaDoDiario[] {
  const dias: DiaDoDiario[] = [];
  for (const reserva of reservas) {
    const dia = diaDe(reserva.criadaEm);
    const atual = dias.at(-1);
    if (atual?.dia === dia) {
      atual.reservas.push(reserva);
    } else {
      dias.push({ dia, rotulo: rotuloDoDia(dia, hoje), contagem: "", reservas: [reserva] });
    }
  }
  return dias.map((d) => ({ ...d, contagem: contarReservas(d.reservas.length) }));
}

export function contarEncontradas(quantidade: number) {
  return quantidade === 1
    ? "1 reserva encontrada"
    : `${quantidade} reservas encontradas`;
}
