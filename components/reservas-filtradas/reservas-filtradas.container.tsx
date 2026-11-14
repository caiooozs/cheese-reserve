"use client";

import type { PropsReservasFiltradas } from "@/components/reservas-filtradas/reservas-filtradas.model";
import { ReservasFiltradasView } from "@/components/reservas-filtradas/reservas-filtradas.view";
import { useReservasFiltradasViewModel } from "@/components/reservas-filtradas/reservas-filtradas.viewmodel";

export function ReservasFiltradas(props: PropsReservasFiltradas) {
  const { dados, busca } = useReservasFiltradasViewModel(props);
  return <ReservasFiltradasView dados={dados} busca={busca} />;
}
