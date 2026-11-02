"use client";

import { LinhaReservaView } from "@/components/linha-reserva/linha-reserva.view";
import { useLinhaReservaViewModel } from "@/components/linha-reserva/linha-reserva.viewmodel";
import type { ReservaPainelDTO } from "@/lib/tipos";

export function LinhaReserva({ reserva }: { reserva: ReservaPainelDTO }) {
  const { dados, acoes } = useLinhaReservaViewModel(reserva);
  return <LinhaReservaView dados={dados} acoes={acoes} />;
}
