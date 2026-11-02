import { connection } from "next/server";
import { FormularioReserva } from "@/components/formulario-reserva/formulario-reserva.container";
import { MENSAGEM_GENERICA } from "@/lib/erros";
import type { VitrineDTO } from "@/lib/tipos";
import { obterVitrine } from "@/service/vitrine/vitrine.service";

export async function Vitrine() {
  // Preço e estoque são sempre os do momento da visita.
  await connection();

  let vitrine: VitrineDTO;
  try {
    vitrine = await obterVitrine();
  } catch {
    return (
      <p role="alert" className="mt-8 text-lg">
        {MENSAGEM_GENERICA}
      </p>
    );
  }

  return <FormularioReserva vitrine={vitrine} />;
}
