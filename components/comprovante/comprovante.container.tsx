"use client";

import { ComprovanteView } from "@/components/comprovante/comprovante.view";
import { useComprovanteViewModel } from "@/components/comprovante/comprovante.viewmodel";
import type { ComprovanteDTO } from "@/lib/tipos";

export function Comprovante({
  comprovante,
  onNovaReserva,
}: {
  comprovante: ComprovanteDTO;
  onNovaReserva: () => void;
}) {
  const { dados, acoes } = useComprovanteViewModel(comprovante, onNovaReserva);

  return <ComprovanteView dados={dados} acoes={acoes} />;
}
