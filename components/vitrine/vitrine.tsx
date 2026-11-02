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
      <p role="alert" className="rounded-xl border bg-card p-4 text-lg [grid-area:formulario] md:self-start">
        {MENSAGEM_GENERICA}
      </p>
    );
  }

  return <FormularioReserva vitrine={vitrine} />;
}
