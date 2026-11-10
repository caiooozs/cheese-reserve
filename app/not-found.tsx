import { SearchXIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TelaAviso } from "@/components/tela-aviso/tela-aviso.view";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

// A tela padrão do Next é em inglês (FR-038).
export default function NaoEncontrada() {
  return (
    <TelaAviso
      Icone={SearchXIcon}
      titulo="Página não encontrada."
      texto="O endereço pode estar errado. Confira o link que você recebeu pelo WhatsApp."
    >
      <Link href="/" className={cn(buttonVariants(), "h-12 text-base")}>
        Ir para a página de reserva
      </Link>
    </TelaAviso>
  );
}
