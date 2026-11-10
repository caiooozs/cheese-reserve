"use client";

import { DialogoCancelarView } from "@/components/dialogo-cancelar/dialogo-cancelar.view";
import { useDialogoCancelarViewModel } from "@/components/dialogo-cancelar/dialogo-cancelar.viewmodel";
import type { ControleDialogo } from "@/components/linha-reserva/linha-reserva.model";
import type { ReservaPainelDTO } from "@/lib/tipos";

export function DialogoCancelar({
  reserva,
  pago,
  ...controle
}: { reserva: ReservaPainelDTO; pago: boolean } & ControleDialogo) {
  const { dados, acoes } = useDialogoCancelarViewModel(reserva, pago, controle);
  return <DialogoCancelarView dados={dados} acoes={acoes} />;
}
