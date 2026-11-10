"use client"; // Limites de erro precisam ser Client Components.

import { RotateCwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { TelaAviso } from "@/components/tela-aviso/tela-aviso.view";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A tela padrão do Next é em inglês (FR-038). Sem detalhes técnicos: o
// servidor já registra o erro (service/supabase/registrar-erro.ts).
export default function ErroInesperado({ retry }: { error: unknown; retry: () => void }) {
  return (
    <TelaAviso
      Icone={TriangleAlertIcon}
      titulo="Algo deu errado."
      texto="Não foi possível carregar esta página. Tente de novo em instantes."
    >
      <Button onClick={() => retry()} className="h-12 text-base">
        <RotateCwIcon aria-hidden className="size-5" />
        Tentar de novo
      </Button>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-12 text-base shadow-xs")}>
        Ir para a página de reserva
      </Link>
    </TelaAviso>
  );
}
