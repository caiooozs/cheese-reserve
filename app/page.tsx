import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Vitrine } from "@/components/vitrine/vitrine";
import { PRODUTO } from "@/lib/produto";

// Como um checkout: produto e preço à esquerda, formulário à direita no desktop;
// uma coluna só no celular.
const GRADE =
  "mx-auto grid w-full max-w-5xl gap-6 px-4 pt-8 pb-12 [grid-template-areas:'produto'_'oferta'_'formulario'] sm:px-6 md:grid-cols-2 md:grid-rows-[auto_auto_1fr] md:gap-x-16 md:gap-y-6 md:px-8 md:pt-20 md:[grid-template-areas:'produto_formulario'_'oferta_formulario'_'oferta_formulario']";

export default function Home() {
  return (
    <main className="flex-1">
      <div className={GRADE}>
        <header className="[grid-area:produto]">
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {PRODUTO.nome}
          </h1>
        </header>

        <Suspense fallback={<CarregandoVitrine />}>
          <Vitrine />
        </Suspense>
      </div>
    </main>
  );
}

function CarregandoVitrine() {
  return (
    <>
      <div aria-hidden className="[grid-area:oferta]">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="mt-3 h-7 w-40 rounded-full" />
      </div>
      <div
        aria-hidden
        className="flex flex-col gap-5 rounded-xl border bg-card p-4 [grid-area:formulario] sm:p-6 md:self-start"
      >
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </>
  );
}
