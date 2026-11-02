import { Suspense } from "react";
import { Cartao } from "@/components/cartao/cartao.view";
import { Skeleton } from "@/components/ui/skeleton";
import { Vitrine } from "@/components/vitrine/vitrine";
import { PRODUTO, SAUDACAO } from "@/lib/produto";

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col bg-primary p-3 sm:py-8">
      <Cartao className="my-auto">
        <div className="relative px-4 pt-5 pb-6">
          <header className="flex flex-col gap-1">
            <p className="pr-28 font-saudacao text-[3.5rem] leading-[0.9] text-selo">
              {SAUDACAO}
            </p>
            <h1 className="text-2xl leading-tight font-bold tracking-tight">
              {PRODUTO.nome}
            </h1>
            <p className="text-base leading-snug text-pretty text-muted-foreground">
              {PRODUTO.descricao}
            </p>
          </header>

          <Suspense fallback={<CarregandoVitrine />}>
            <Vitrine />
          </Suspense>
        </div>
      </Cartao>
    </main>
  );
}

function CarregandoVitrine() {
  return (
    <div aria-hidden>
      <Skeleton className="absolute top-6 right-3 h-20 w-28" />
      <Skeleton className="mt-3 h-6 w-40" />
      <div className="mt-6 flex flex-col gap-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-44" />
      </div>
    </div>
  );
}
