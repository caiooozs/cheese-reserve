"use client";

import { DialogoDadosView } from "@/components/dialogo-dados-cliente/dialogo-dados-cliente.view";
import { useDialogoDadosViewModel } from "@/components/dialogo-dados-cliente/dialogo-dados-cliente.viewmodel";
import type { ControleDialogo } from "@/components/linha-reserva/linha-reserva.model";
import type { ReservaPainelDTO } from "@/lib/tipos";

export function DialogoDadosCliente({
  reserva,
  ...controle
}: { reserva: ReservaPainelDTO } & ControleDialogo) {
  const { dados, campos, acoes } = useDialogoDadosViewModel(reserva, controle);
  return <DialogoDadosView dados={dados} campos={campos} acoes={acoes} />;
}
