import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Tela inteira para quando a página não pode aparecer: endereço errado ou erro
// inesperado. Mesmo desenho dos avisos da venda: ícone num círculo, título e texto.
export function TelaAviso({
  Icone,
  titulo,
  texto,
  children,
}: {
  Icone: LucideIcon;
  titulo: string;
  texto: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Icone aria-hidden className="size-6 text-muted-foreground" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-balance">{titulo}</h1>
        <p className="mt-2 text-base leading-snug text-pretty text-muted-foreground">{texto}</p>
        <div className="mt-8 flex w-full flex-col gap-3">{children}</div>
      </div>
    </main>
  );
}
