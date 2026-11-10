import { ClockIcon, LockIcon, PackageXIcon } from "lucide-react";
import type { EstadoVitrine } from "@/lib/tipos";

const AVISOS = {
  nao_abriu: {
    Icone: ClockIcon,
    titulo: "As reservas ainda não abriram.",
    texto: "Volte em breve!",
  },
  encerrada: {
    Icone: LockIcon,
    titulo: "As reservas estão encerradas.",
    texto: "Obrigada!",
  },
  esgotada: {
    Icone: PackageXIcon,
    titulo: "Esgotou!",
    texto: "Todas as peças já foram reservadas.",
  },
} satisfies Record<Exclude<EstadoVitrine, "aberta">, unknown>;

export function AvisoVenda({ estado }: { estado: Exclude<EstadoVitrine, "aberta"> }) {
  const { Icone, titulo, texto } = AVISOS[estado];

  return (
    <div role="status" className="flex flex-col items-center px-2 py-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icone aria-hidden className="size-6 text-muted-foreground" />
      </span>
      <p className="mt-4 text-xl font-semibold tracking-tight text-balance">{titulo}</p>
      <p className="mt-1 text-base text-muted-foreground">{texto}</p>
    </div>
  );
}
