import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  useController,
  useForm,
  type FieldPath,
  type UseControllerReturn,
} from "react-hook-form";
import {
  schemaLogin,
  VALORES_INICIAIS,
  type CampoLogin,
  type EntradaLogin,
  type FormularioLoginViewProps,
  type SaidaLogin,
} from "@/components/formulario-login/formulario-login.model";
import { MENSAGEM_GENERICA, traduzirErro } from "@/lib/erros";
import { entrar } from "@/service/auth/auth.actions";

function ligarCampo<Nome extends FieldPath<EntradaLogin>>({
  field,
  fieldState,
}: UseControllerReturn<EntradaLogin, Nome>): CampoLogin {
  return {
    input: {
      name: field.name,
      value: field.value,
      ref: field.ref,
      onBlur: field.onBlur,
      onChange: field.onChange,
    },
    erro: fieldState.error?.message,
  };
}

export function useFormularioLoginViewModel(): FormularioLoginViewProps {
  // exigirAdmin() devolve aqui quem entrou com uma conta que não é a da vendedora.
  const semAcesso = useSearchParams().get("erro") === "sem-acesso";
  const [erro, setErro] = useState<string | null>(null);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [enviando, iniciarEnvio] = useTransition();

  const form = useForm<EntradaLogin, unknown, SaidaLogin>({
    resolver: zodResolver(schemaLogin),
    defaultValues: VALORES_INICIAIS,
  });
  const email = useController({ name: "email", control: form.control });
  const senha = useController({ name: "senha", control: form.control });

  async function submeter(dados: SaidaLogin) {
    setErro(null);
    let resultado;
    try {
      resultado = await entrar(dados);
    } catch {
      setErro(MENSAGEM_GENERICA);
      return;
    }
    // Sem resposta: a action redirecionou para o painel.
    if (resultado && !resultado.ok) {
      setErro(traduzirErro(resultado.erro));
      form.resetField("senha");
      form.setFocus("senha");
    }
  }

  return {
    dados: {
      aviso: erro ?? (semAcesso ? traduzirErro("sem_acesso") : null),
      enviando,
      senhaVisivel,
    },
    campos: {
      email: ligarCampo(email),
      senha: ligarCampo(senha),
    },
    acoes: {
      enviar(evento) {
        iniciarEnvio(() => form.handleSubmit(submeter)(evento));
      },
      alternarSenha: () => setSenhaVisivel((visivel) => !visivel),
    },
  };
}
