import { InboxIcon } from "lucide-react";
import { LinhaReserva } from "@/components/linha-reserva/linha-reserva.container";
import {
  agruparPorDia,
  contarEncontradas,
} from "@/components/lista-reservas/lista-reservas.model";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { COLUNAS_RESERVA } from "@/lib/estilos";
import type { ReservaPainelDTO } from "@/lib/tipos";
import { cn } from "@/lib/utils";

// Reservas das mais recentes para as mais antigas, agrupadas por dia.
export function ListaReservas({
  reservas,
  hoje,
  filtrando,
  buscaPorCodigo,
}: {
  reservas: ReservaPainelDTO[];
  hoje: string;
  filtrando: boolean;
  buscaPorCodigo: boolean;
}) {
  if (reservas.length === 0) {
    return (
      <Empty className="rounded-xl border bg-card px-5 py-10 shadow-xs">
        <EmptyHeader>
          <EmptyMedia className="flex size-12 items-center justify-center rounded-full bg-muted">
            <InboxIcon aria-hidden className="size-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle className="text-lg font-semibold">Nenhuma reserva encontrada.</EmptyTitle>
          <EmptyDescription className="text-base text-muted-foreground">
            {buscaPorCodigo
              ? "Confira o código digitado no comprovante."
              : filtrando
                ? "Nenhuma reserva combina com esses filtros."
                : "Quando alguém reservar pela página, a reserva aparece aqui."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {filtrando && (
        <p role="status" className="text-sm font-medium text-muted-foreground">
          {contarEncontradas(reservas.length)}
        </p>
      )}

      <div
        aria-hidden
        className={cn(
          "hidden gap-x-4 px-4 text-sm font-medium text-muted-foreground md:grid",
          COLUNAS_RESERVA,
        )}
      >
        <span>Reserva</span>
        <span className="text-right">Total</span>
        <span>Pagamento</span>
        <span>Entrega</span>
      </div>

      {agruparPorDia(reservas, hoje).map(({ dia, rotulo, contagem, reservas: doDia }) => (
        <section key={dia} aria-labelledby={`dia-${dia}`} className="flex flex-col gap-2">
          <header className="flex items-baseline justify-between gap-3 px-1">
            <h3 id={`dia-${dia}`} className="text-base font-semibold">
              {rotulo}
            </h3>
            <p className="text-sm text-muted-foreground tabular-nums">{contagem}</p>
          </header>
          <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
            {doDia.map((reserva) => (
              <li key={reserva.id}>
                <LinhaReserva reserva={reserva} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
