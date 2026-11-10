import { MinusIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AvisoVenda } from "@/components/aviso-venda/aviso-venda.view";
import type { FormularioReservaViewProps } from "@/components/formulario-reserva/formulario-reserva.model";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { CAMPO, STEPPER_CAIXA, STEPPER_NUMERO } from "@/lib/estilos";
import { PRODUTO } from "@/lib/produto";
import type { EstadoVitrine } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const SITUACAO: Record<Exclude<EstadoVitrine, "aberta">, string> = {
  nao_abriu: "Reservas ainda não abriram",
  encerrada: "Reservas encerradas",
  esgotada: "Esgotado",
};

const PASSOS = [
  "Preencha seus dados e escolha quantas peças quer.",
  "Envie o comprovante para a vendedora pelo WhatsApp.",
  "Ela responde com os dados para pagamento.",
];

function Campo({
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
    <Field data-invalid={Boolean(erro)} className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-base font-medium">
        {rotulo}
      </FieldLabel>
      {children}
      {ajuda && <FieldDescription className="text-sm">{ajuda}</FieldDescription>}
      <FieldError errors={erro ? [{ message: erro }] : []} className="text-sm" />
    </Field>
  );
}

export function FormularioReservaView({
  dados,
  campos,
  acoes,
}: FormularioReservaViewProps) {
  const aberta = dados.estado === "aberta";

  return (
    <>
      {/* Preço e situação: à esquerda no desktop, logo abaixo do título no celular.
          No desktop, o resumo do pedido acompanha a rolagem do formulário. */}
      <div className="[grid-area:oferta]">
        <div className="md:sticky md:top-8">
          {dados.estado !== "nao_abriu" && (
            <p className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {dados.preco}
              </span>
              <span className="text-base text-muted-foreground">por peça</span>
            </p>
          )}
          <p
            className={cn(
              "mt-3 inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium tabular-nums",
              aberta && dados.poucasPecas && "border-aviso/40 bg-aviso-fundo text-aviso",
              aberta && !dados.poucasPecas && "bg-card text-muted-foreground",
              dados.estado === "esgotada" && "border-destructive/30 bg-destructive/5 text-destructive",
              (dados.estado === "nao_abriu" || dados.estado === "encerrada") &&
                "bg-muted text-muted-foreground",
            )}
          >
            {aberta ? dados.disponibilidade : SITUACAO[dados.estado as keyof typeof SITUACAO]}
          </p>

          {aberta && !dados.recebida && dados.total && (
            <div className="mt-8 hidden rounded-xl border bg-card p-5 shadow-xs md:block">
              <h2 className="text-base font-semibold">Resumo do pedido</h2>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-medium">{PRODUTO.nome}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">{dados.conta}</p>
                </div>
                <p className="text-base tabular-nums">{dados.total}</p>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4 border-t pt-4">
                <span className="text-base font-medium">Total</span>
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {dados.total}
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 hidden md:block">
            <h2 className="text-base font-semibold">Como funciona</h2>
            <ol className="mt-4 flex flex-col gap-4">
              {PASSOS.map((passo, i) => (
                <li key={passo} className="flex gap-3 text-base text-muted-foreground">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium text-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{passo}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <section
        aria-labelledby={aberta && !dados.recebida ? "titulo-formulario" : undefined}
        className="rounded-xl border bg-card p-4 shadow-xs [grid-area:formulario] sm:p-6 md:self-start"
      >
        {dados.recebida ? (
          <p role="status" className="py-6 text-center text-xl font-semibold">
            Reserva recebida.
          </p>
        ) : !aberta ? (
          <AvisoVenda estado={dados.estado as Exclude<EstadoVitrine, "aberta">} />
        ) : (
          <>
            <h2 id="titulo-formulario" className="text-lg font-semibold tracking-tight">
              Fazer reserva
            </h2>

            <form noValidate onSubmit={acoes.enviar} className="relative mt-5 flex flex-col gap-5">
              <Campo id="nome" rotulo="Nome" erro={campos.nome.erro}>
                <Input
                  {...campos.nome.input}
                  id="nome"
                  autoComplete="name"
                  aria-invalid={Boolean(campos.nome.erro)}
                  className={CAMPO}
                />
              </Campo>

              <Campo
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
                  className={cn(CAMPO, "tabular-nums")}
                />
              </Campo>

              <Campo
                id="quantidade"
                rotulo="Quantidade de peças"
                ajuda={dados.limite}
                erro={campos.quantidade.erro}
              >
                {/* O Field estica os filhos; o invólucro deixa a caixa só do tamanho dos botões. */}
                <div>
                <div className={STEPPER_CAIXA}>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Diminuir quantidade"
                    disabled={!dados.podeDiminuir}
                    onClick={acoes.diminuir}
                    className="h-12 w-12 rounded-r-none"
                  >
                    <MinusIcon aria-hidden className="size-5" />
                  </Button>
                  <Input
                    {...campos.quantidade.input}
                    id="quantidade"
                    inputMode="numeric"
                    autoComplete="off"
                    aria-invalid={Boolean(campos.quantidade.erro)}
                    className={STEPPER_NUMERO}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Aumentar quantidade"
                    disabled={!dados.podeAumentar}
                    onClick={acoes.aumentar}
                    className="h-12 w-12 rounded-l-none"
                  >
                    <PlusIcon aria-hidden className="size-5" />
                  </Button>
                </div>
                </div>
              </Campo>

              <Campo
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
                  className={cn(CAMPO, "h-auto min-h-20 resize-none py-3")}
                />
              </Campo>

              {/* Campo-armadilha: invisível para pessoas, preenchido só por robôs. */}
              <div aria-hidden className="absolute -left-[9999px]">
                <label htmlFor="site">Site</label>
                <input id="site" name="site" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              {dados.precoNovo && (
                <p
                  role="alert"
                  className="flex gap-3 rounded-lg border border-aviso/30 bg-aviso-fundo p-3 text-base leading-snug"
                >
                  <TriangleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-aviso" />
                  <span>
                    O preço mudou para{" "}
                    <strong className="font-semibold whitespace-nowrap">
                      {dados.precoNovo} por peça
                    </strong>
                    . Confira o total e toque em Reservar para confirmar.
                  </span>
                </p>
              )}

              {dados.total && (
                <div className="flex items-end justify-between gap-4 rounded-lg bg-muted px-4 py-3 md:hidden">
                  <div className="flex flex-col">
                    <span className="text-base font-medium">Total</span>
                    <span className="text-sm text-muted-foreground tabular-nums">{dados.conta}</span>
                  </div>
                  <span className="text-2xl font-semibold tracking-tight tabular-nums">
                    {dados.total}
                  </span>
                </div>
              )}

              <Button
                type="submit"
                disabled={dados.enviando}
                className="h-12 text-base font-medium"
              >
                {dados.enviando && <Spinner aria-hidden />}
                {dados.enviando ? "Reservando…" : "Reservar"}
              </Button>
              <p className="-mt-1 text-sm leading-snug text-pretty text-muted-foreground md:hidden">
                Depois de reservar, envie o comprovante para a vendedora pelo WhatsApp. Ela
                responde com os dados para pagamento.
              </p>
            </form>
          </>
        )}
      </section>
    </>
  );
}
