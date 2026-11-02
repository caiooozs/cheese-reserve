import { MinusIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AvisoVenda } from "@/components/aviso-venda/aviso-venda.view";
import type { FormularioReservaViewProps } from "@/components/formulario-reserva/formulario-reserva.model";
import { Selo } from "@/components/selo/selo.view";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

// Os campos são as linhas de endereço de um cartão postal.
const LINHA =
  "scroll-mt-20 rounded-none border-0 border-b-2 border-input bg-transparent px-0 text-lg shadow-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-0 aria-invalid:border-destructive aria-invalid:ring-0 md:text-lg";

function Linha({
  id,
  rotulo,
  ajuda,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  ajuda?: string;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={Boolean(erro)} className="gap-1">
      <FieldLabel htmlFor={id} className="text-base">
        {rotulo}
      </FieldLabel>
      {children}
      {ajuda && <FieldDescription>{ajuda}</FieldDescription>}
      <FieldError errors={erro ? [{ message: erro }] : []} className="text-base" />
    </Field>
  );
}

export function FormularioReservaView({
  dados,
  campos,
  acoes,
}: FormularioReservaViewProps) {
  if (dados.recebida) {
    return (
      <p role="status" className="mt-8 text-xl font-medium">
        Reserva recebida.
      </p>
    );
  }

  if (dados.estado !== "aberta") {
    return <AvisoVenda estado={dados.estado} />;
  }

  return (
    <>
      <Selo valor={dados.preco} rotulo="por peça" className="absolute top-6 right-3" />

      <p className="mt-3 text-base font-semibold tabular-nums">{dados.disponibilidade}</p>

      <form noValidate onSubmit={acoes.enviar} className="relative mt-6 flex flex-col gap-5">
        <Linha id="nome" rotulo="Nome" erro={campos.nome.erro}>
          <Input
            {...campos.nome.input}
            id="nome"
            autoComplete="name"
            aria-invalid={Boolean(campos.nome.erro)}
            className={`h-11 ${LINHA}`}
          />
        </Linha>

        <Linha
          id="whatsapp"
          rotulo="WhatsApp"
          ajuda="Com DDD. Exemplo: (11) 98765-4321"
          erro={campos.whatsapp.erro}
        >
          <Input
            {...campos.whatsapp.input}
            id="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(campos.whatsapp.erro)}
            className={`h-11 tabular-nums ${LINHA}`}
          />
        </Linha>

        <Linha
          id="quantidade"
          rotulo="Quantidade de queijos"
          ajuda={dados.limite}
          erro={campos.quantidade.erro}
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              aria-label="Diminuir quantidade"
              disabled={!dados.podeDiminuir}
              onClick={acoes.diminuir}
              className="size-12 border-input bg-transparent"
            >
              <MinusIcon aria-hidden />
            </Button>
            <Input
              {...campos.quantidade.input}
              id="quantidade"
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={Boolean(campos.quantidade.erro)}
              className={`h-12 w-16 text-center font-semibold tabular-nums ${LINHA} text-xl md:text-xl`}
            />
            <Button
              type="button"
              variant="outline"
              aria-label="Aumentar quantidade"
              disabled={!dados.podeAumentar}
              onClick={acoes.aumentar}
              className="size-12 border-input bg-transparent"
            >
              <PlusIcon aria-hidden />
            </Button>
          </div>
        </Linha>

        <Linha
          id="endereco"
          rotulo="Endereço de entrega (opcional)"
          ajuda="Se não informar, a entrega é combinada pelo WhatsApp."
          erro={campos.endereco.erro}
        >
          <Textarea
            {...campos.endereco.input}
            id="endereco"
            rows={2}
            autoComplete="street-address"
            aria-invalid={Boolean(campos.endereco.erro)}
            className={`resize-none ${LINHA}`}
          />
        </Linha>

        {/* Campo-armadilha: invisível para pessoas, preenchido só por robôs. */}
        <div aria-hidden className="absolute -left-[9999px]">
          <label htmlFor="site">Site</label>
          <input id="site" name="site" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-col gap-3 border-t-2 border-dashed border-input pt-4">
          {dados.precoNovo && (
            <p role="alert" className="text-base leading-snug">
              O preço mudou para{" "}
              <strong className="font-bold whitespace-nowrap text-selo">
                {dados.precoNovo} por peça
              </strong>
              . Confira o novo total e toque em Reservar para confirmar.
            </p>
          )}
          {dados.total && (
            <p className="flex items-baseline justify-between text-lg">
              <span>Total</span>
              <span className="text-2xl font-bold tabular-nums">{dados.total}</span>
            </p>
          )}
          <Button
            type="submit"
            disabled={dados.enviando}
            className="h-13 border-0 bg-clip-border text-lg"
          >
            {dados.enviando && <Spinner aria-hidden />}
            {dados.enviando ? "Reservando…" : "Reservar"}
          </Button>
          <p className="text-base leading-snug text-pretty text-muted-foreground">
            Depois de reservar, você envia o comprovante para a vendedora pelo WhatsApp e
            ela responde com os dados para pagamento.
          </p>
        </div>
      </form>
    </>
  );
}
