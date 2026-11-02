import { LogOutIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Painel } from "@/components/painel/painel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUTO } from "@/lib/produto";
import { sair } from "@/service/auth/auth.actions";

export const metadata: Metadata = {
  title: "Painel da venda",
  robots: { index: false, follow: false },
};

export default function PaginaPainel({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6 md:px-8">
          <div className="min-w-0">
            <h1 className="text-lg leading-tight font-semibold tracking-tight">Painel da venda</h1>
            <p className="truncate text-sm text-muted-foreground">{PRODUTO.nome}</p>
          </div>
          <form action={sair}>
            <Button type="submit" variant="ghost" className="h-11 px-3 text-base">
              <LogOutIcon aria-hidden className="size-5" />
              Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 pt-4 pb-12 sm:px-6 md:px-8 md:pt-8">
        <Suspense fallback={<CarregandoPainel />}>
          <Painel searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

function CarregandoPainel() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="col-span-2 h-24 rounded-xl md:col-span-1" />
      </div>
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
