"use client";

import { DialogoCancelar } from "@/components/dialogo-cancelar/dialogo-cancelar.container";
import { DialogoDadosCliente } from "@/components/dialogo-dados-cliente/dialogo-dados-cliente.container";
import { DialogoQuantidade } from "@/components/dialogo-quantidade/dialogo-quantidade.container";
import { LinhaReservaView } from "@/components/linha-reserva/linha-reserva.view";
import { useLinhaReservaViewModel } from "@/components/linha-reserva/linha-reserva.viewmodel";
import type { ReservaPainelDTO } from "@/lib/tipos";

// Os diálogos só existem enquanto estão em uso: cada vez abrem com os dados atuais.
export function LinhaReserva({
  reserva,
  disponivel,
}: {
  reserva: ReservaPainelDTO;
  disponivel: number;
}) {
  const { dados, acoes } = useLinhaReservaViewModel(reserva);
  const controle = {
    aberto: dados.dialogoAberto,
    aoMudarAberto: acoes.mudarDialogo,
    aoTerminar: acoes.terminarDialogo,
  };

  return (
    <>
      <LinhaReservaView dados={dados} acoes={acoes} />
      {dados.dialogo === "quantidade" && (
        <DialogoQuantidade reserva={reserva} disponivel={disponivel} {...controle} />
      )}
      {dados.dialogo === "dados" && <DialogoDadosCliente reserva={reserva} {...controle} />}
      {dados.dialogo === "cancelar" && (
        <DialogoCancelar reserva={reserva} pago={dados.pago} {...controle} />
      )}
    </>
  );
}
