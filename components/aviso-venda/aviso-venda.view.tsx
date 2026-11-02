import { Carimbo } from "@/components/carimbo/carimbo.view";
import { SAUDACAO } from "@/lib/produto";
import type { EstadoVitrine } from "@/lib/tipos";

const AVISOS: Record<
  Exclude<EstadoVitrine, "aberta">,
  { carimbo: string[]; texto: string }
> = {
  nao_abriu: {
    carimbo: ["Em", "breve"],
    texto: "As reservas ainda não abriram. Volte em breve!",
  },
  encerrada: {
    carimbo: ["Encerradas"],
    texto: "As reservas estão encerradas. Obrigada!",
  },
  esgotada: {
    carimbo: ["Esgotou"],
    texto: "Esgotou! Todas as peças já foram reservadas.",
  },
};

export function AvisoVenda({ estado }: { estado: Exclude<EstadoVitrine, "aberta"> }) {
  const { carimbo, texto } = AVISOS[estado];

  return (
    <>
      <Carimbo arco={SAUDACAO} linhas={carimbo} className="absolute top-5 right-3 size-28" />
      <p role="status" className="mt-8 text-xl leading-snug font-medium text-balance">
        {texto}
      </p>
    </>
  );
}
