"use client";

import type { ControleDialogo } from "@/components/linha-reserva/linha-reserva.model";
import { DialogoQuantidadeView } from "@/components/dialogo-quantidade/dialogo-quantidade.view";
import { useDialogoQuantidadeViewModel } from "@/components/dialogo-quantidade/dialogo-quantidade.viewmodel";
import type { ReservaPainelDTO } from "@/lib/tipos";

export function DialogoQuantidade({
  reserva,
  disponivel,
  ...controle
}: { reserva: ReservaPainelDTO; disponivel: number } & ControleDialogo) {
  const { dados, campos, acoes } = useDialogoQuantidadeViewModel(reserva, disponivel, controle);
  return <DialogoQuantidadeView dados={dados} campos={campos} acoes={acoes} />;
}
