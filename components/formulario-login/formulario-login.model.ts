import type { ChangeEvent, FormEvent } from "react";
import type { RefCallBack } from "react-hook-form";
import { z } from "zod";

export const schemaLogin = z.object({
  email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
  senha: z.string().min(1, "Informe a senha."),
});

export type EntradaLogin = z.input<typeof schemaLogin>;
export type SaidaLogin = z.output<typeof schemaLogin>;

export const VALORES_INICIAIS: EntradaLogin = { email: "", senha: "" };

export type CampoLogin = {
  input: {
    name: string;
    value: string;
    ref: RefCallBack;
    onBlur: () => void;
    onChange: (evento: ChangeEvent<HTMLInputElement>) => void;
  };
  erro?: string;
};

export type DadosLogin = {
  // Erro da tentativa ou aviso de conta sem acesso, já em português.
  aviso: string | null;
  enviando: boolean;
  senhaVisivel: boolean;
};

export type CamposLogin = Record<keyof EntradaLogin, CampoLogin>;

export type AcoesLogin = {
  enviar: (evento: FormEvent<HTMLFormElement>) => void;
  alternarSenha: () => void;
};

export type FormularioLoginViewProps = {
  dados: DadosLogin;
  campos: CamposLogin;
  acoes: AcoesLogin;
};
