"use client";

import { Comprovante } from "@/components/comprovante/comprovante.container";
import { FormularioReservaView } from "@/components/formulario-reserva/formulario-reserva.view";
import { useFormularioReservaViewModel } from "@/components/formulario-reserva/formulario-reserva.viewmodel";
import type { VitrineDTO } from "@/lib/tipos";

export function FormularioReserva({ vitrine }: { vitrine: VitrineDTO }) {
  const { dados, campos, acoes } = useFormularioReservaViewModel(vitrine);

  if (dados.comprovante) {
    return (
      <Comprovante
        comprovante={dados.comprovante}
        onNovaReserva={acoes.novaReserva}
      />
    );
  }

  return <FormularioReservaView dados={dados} campos={campos} acoes={acoes} />;
}
