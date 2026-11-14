import { BotaoAtualizar } from "@/components/botao-atualizar/botao-atualizar.container";
import { ConfiguracoesVenda } from "@/components/configuracoes-venda/configuracoes-venda.container";
import { ReservasFiltradas } from "@/components/reservas-filtradas/reservas-filtradas.container";
import { ResumoPainel } from "@/components/resumo-painel/resumo-painel.view";
import { MENSAGEM_GENERICA } from "@/lib/erros";
import { diaDe } from "@/lib/formatacao";
import { schemaFiltrosPainel } from "@/lib/schemas";
import type { ReservaPainelDTO, ResumoPainelDTO } from "@/lib/tipos";
import { exigirAdmin } from "@/service/auth/auth.service";
import { listarReservas, resumoPainel } from "@/service/reservas/reservas.service";

// Lê a sessão e os filtros da URL, então só roda dentro do <Suspense> da página.
export async function Painel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await exigirAdmin();
  const filtros = schemaFiltrosPainel.parse(await searchParams);

  let resumo: ResumoPainelDTO;
  let reservas: ReservaPainelDTO[];
  try {
    [resumo, reservas] = await Promise.all([
      resumoPainel(supabase),
      listarReservas(supabase, filtros),
    ]);
  } catch {
    return (
      <p role="alert" className="rounded-xl border bg-card p-4 text-lg">
        {MENSAGEM_GENERICA}
      </p>
    );
  }

  // exigirAdmin() já adiou tudo para a hora da visita: "Hoje" é o dia de agora.
  const hoje = diaDe(new Date().toISOString());

  return (
    <>
      <ResumoPainel resumo={resumo} />
      <ConfiguracoesVenda resumo={resumo} />
      <section aria-labelledby="titulo-reservas" className="flex flex-col gap-3">
        <div className="-my-1.5 flex items-center justify-between gap-3">
          <h2 id="titulo-reservas" className="text-lg font-semibold tracking-tight">
            Reservas
          </h2>
          {/* Traz reservas novas sem recarregar a página nem perder os filtros. */}
          <div className="-mr-3">
            <BotaoAtualizar />
          </div>
        </div>
        {/* A busca por nome ou código filtra no navegador; os filtros, no servidor. */}
        <ReservasFiltradas
          filtros={filtros}
          reservas={reservas}
          hoje={hoje}
          disponivel={resumo.disponivel}
        />
      </section>
    </>
  );
}
