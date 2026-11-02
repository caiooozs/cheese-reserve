import { CircleAlertIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { FormularioLoginViewProps } from "@/components/formulario-login/formulario-login.model";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { CAMPO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

function Campo({
  id,
  rotulo,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={Boolean(erro)} className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-base font-medium">
        {rotulo}
      </FieldLabel>
      {children}
      <FieldError errors={erro ? [{ message: erro }] : []} className="text-sm" />
    </Field>
  );
}

export function FormularioLoginView({ dados, campos, acoes }: FormularioLoginViewProps) {
  return (
    <form noValidate onSubmit={acoes.enviar} className="flex flex-col gap-5">
      {dados.aviso && (
        <p
          role="alert"
          className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-base leading-snug"
        >
          <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
          {dados.aviso}
        </p>
      )}

      <Campo id="email" rotulo="E-mail" erro={campos.email.erro}>
        <Input
          {...campos.email.input}
          id="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(campos.email.erro)}
          className={CAMPO}
        />
      </Campo>

      <Campo id="senha" rotulo="Senha" erro={campos.senha.erro}>
        <div className="relative">
          <Input
            {...campos.senha.input}
            id="senha"
            type={dados.senhaVisivel ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(campos.senha.erro)}
            className={cn(CAMPO, "pr-12")}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={acoes.alternarSenha}
            aria-label={dados.senhaVisivel ? "Esconder a senha" : "Mostrar a senha"}
            aria-pressed={dados.senhaVisivel}
            className="absolute top-0.5 right-0.5 size-11 text-muted-foreground hover:text-foreground"
          >
            {dados.senhaVisivel ? (
              <EyeOffIcon aria-hidden className="size-5" />
            ) : (
              <EyeIcon aria-hidden className="size-5" />
            )}
          </Button>
        </div>
      </Campo>

      <Button
        type="submit"
        disabled={dados.enviando}
        className="mt-1 h-12 text-base font-medium"
      >
        {dados.enviando && <Spinner aria-hidden />}
        {dados.enviando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
