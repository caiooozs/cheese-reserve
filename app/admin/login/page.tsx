import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioLogin } from "@/components/formulario-login/formulario-login.container";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUTO } from "@/lib/produto";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default function PaginaLogin() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar no painel</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Área da vendedora, para acompanhar as reservas de {PRODUTO.nome.toLowerCase()}.
        </p>

        <div className="mt-6 rounded-xl border bg-card p-4 shadow-xs sm:p-6">
          {/* O formulário lê ?erro= da URL, então espera dentro do limite. */}
          <Suspense fallback={<CarregandoFormulario />}>
            <FormularioLogin />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

function CarregandoFormulario() {
  return (
    <div aria-hidden className="flex flex-col gap-5">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
