import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import {
  OPCOES_ENTREGA,
  OPCOES_PAGAMENTO,
  OPCOES_SITUACAO,
  type BuscaFiltrosViewProps,
} from "@/components/busca-filtros/busca-filtros.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { CAMPO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

const SELECAO =
  "w-full md:w-auto md:min-w-40 [&>select]:h-12 [&>select]:rounded-lg [&>select]:bg-card [&>select]:pl-3.5 [&>select]:pr-10 [&>select]:text-base [&>select]:shadow-xs [&>svg]:right-3 [&>svg]:size-5 dark:[&>select]:bg-card";

function Selecao({
  id,
  rotulo,
  opcoes,
  campo,
}: {
  id: string;
  rotulo: string;
  opcoes: { valor: string; rotulo: string }[];
  campo: BuscaFiltrosViewProps["campos"]["pagamento"];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {rotulo}
      </label>
      <NativeSelect id={id} {...campo} className={SELECAO}>
        {opcoes.map((opcao) => (
          <NativeSelectOption key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

// Busca e filtros vivem na URL. No celular os filtros abrem por um botão;
// no desktop ficam sempre à mostra, na mesma linha da busca.
export function BuscaFiltrosView({ dados, campos, acoes }: BuscaFiltrosViewProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
      <form role="search" onSubmit={acoes.buscar} className="flex flex-col gap-1.5 md:min-w-72 md:flex-1">
        <label htmlFor="busca-codigo" className="text-sm font-medium">
          Buscar pelo código
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              {...campos.codigo}
              id="busca-codigo"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="search"
              className={cn(CAMPO, "pl-11 font-mono tracking-[0.12em] uppercase")}
            />
          </div>
          <Button type="submit" variant="outline" className="h-12 px-4 text-base shadow-xs">
            {dados.atualizando && <Spinner aria-hidden className="size-5" />}
            Buscar
          </Button>
        </div>
      </form>

      <Button
        type="button"
        variant="outline"
        onClick={acoes.alternarFiltros}
        aria-expanded={dados.filtrosAbertos}
        aria-controls="painel-filtros"
        className="h-12 justify-between px-4 text-base shadow-xs md:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontalIcon aria-hidden className="size-5" />
          {dados.quantidadeFiltros > 0 ? `Filtros (${dados.quantidadeFiltros})` : "Filtros"}
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn(
            "size-5 transition-transform duration-200 motion-reduce:transition-none",
            dados.filtrosAbertos && "rotate-180",
          )}
        />
      </Button>

      <div
        id="painel-filtros"
        className={cn(
          "grid gap-3 sm:grid-cols-3 md:flex md:items-end",
          !dados.filtrosAbertos && "hidden md:flex",
        )}
      >
        <Selecao
          id="filtro-pagamento"
          rotulo="Pagamento"
          opcoes={OPCOES_PAGAMENTO}
          campo={campos.pagamento}
        />
        <Selecao
          id="filtro-entrega"
          rotulo="Entrega"
          opcoes={OPCOES_ENTREGA}
          campo={campos.entrega}
        />
        <Selecao
          id="filtro-situacao"
          rotulo="Situação"
          opcoes={OPCOES_SITUACAO}
          campo={campos.situacao}
        />
      </div>

      {dados.rotuloLimpar && (
        <Button
          variant="ghost"
          onClick={acoes.limpar}
          className="h-12 self-start px-3 text-base md:self-auto"
        >
          <XIcon aria-hidden className="size-5" />
          {dados.rotuloLimpar}
        </Button>
      )}

      {dados.atualizando && (
        <span role="status" className="sr-only">
          Atualizando a lista
        </span>
      )}
    </div>
  );
}
