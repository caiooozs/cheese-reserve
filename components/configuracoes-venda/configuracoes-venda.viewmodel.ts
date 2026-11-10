import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import {
  useController,
  useForm,
  useFormState,
  useWatch,
  type FieldValues,
  type Path,
  type UseControllerReturn,
} from "react-hook-form";
import {
  precisaConfigurar,
  resumoDaVenda,
  schemaPrecoFormulario,
  schemaTotalFormulario,
  textosDaAbertura,
  textoDoEstoque,
  valoresIniciais,
  type CampoTexto,
  type ConfiguracoesVendaViewProps,
  type EntradaPreco,
  type EntradaTotal,
  type SaidaPreco,
  type SaidaTotal,
} from "@/components/configuracoes-venda/configuracoes-venda.model";
import { toast } from "@/components/ui/toast";
import { centavosParaCampo } from "@/lib/dinheiro";
import { MENSAGEM_GENERICA, traduzirErro } from "@/lib/erros";
import { formatarReais } from "@/lib/formatacao";
import type { ResultadoAcao, ResumoPainelDTO } from "@/lib/tipos";
import {
  definirEstoqueTotal,
  definirPreco,
  definirReservasAbertas,
} from "@/service/configuracao/configuracao.actions";

function ligarCampo<Valores extends FieldValues, Nome extends Path<Valores>>({
  field,
  fieldState,
}: UseControllerReturn<Valores, Nome>): CampoTexto {
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

async function chamar(acao: () => Promise<ResultadoAcao>) {
  try {
    return await acao();
  } catch {
    return null;
  }
}

export function useConfiguracoesVendaViewModel(
  resumo: ResumoPainelDTO,
): ConfiguracoesVendaViewProps {
  const router = useRouter();
  const [aberta, setAberta] = useState(() => precisaConfigurar(resumo));
  const [salvandoPreco, iniciarPreco] = useTransition();
  const [salvandoTotal, iniciarTotal] = useTransition();
  const [, iniciarAbertura] = useTransition();

  // A chave muda na hora; se a action falhar, volta ao que veio do servidor.
  const [abertas, aplicarAbertas] = useOptimistic(resumo.reservasAbertas);

  const iniciais = valoresIniciais(resumo);
  const formPreco = useForm<EntradaPreco, unknown, SaidaPreco>({
    resolver: zodResolver(schemaPrecoFormulario),
    defaultValues: iniciais.preco,
  });
  const formTotal = useForm<EntradaTotal, unknown, SaidaTotal>({
    resolver: zodResolver(schemaTotalFormulario),
    defaultValues: iniciais.total,
  });
  const preco = useController({ name: "preco", control: formPreco.control });
  const total = useController({ name: "total", control: formTotal.control });
  const totalDigitado = useWatch({ name: "total", control: formTotal.control });
  // Salvar só fica ativo quando o campo difere do que está salvo.
  const { isDirty: precoAlterado } = useFormState({ control: formPreco.control });
  const { isDirty: totalAlterado } = useFormState({ control: formTotal.control });
  const abertura = textosDaAbertura(resumo, abertas);

  // Erro que não é de campo: aviso passageiro. Sessão vencida recarrega e cai no login.
  function avisarErro(erro: string | undefined) {
    toast.add({ title: erro ? traduzirErro(erro) : MENSAGEM_GENERICA, type: "error" });
    if (erro === "nao_autorizado") {
      router.refresh();
    }
  }

  async function enviarPreco({ preco: centavos }: SaidaPreco) {
    // Vai o texto já no formato do campo, que a action valida de novo.
    const texto = centavosParaCampo(centavos);
    const resultado = await chamar(() => definirPreco({ preco: texto }));

    if (resultado?.ok) {
      formPreco.reset({ preco: texto });
      toast.add({
        title: `Preço salvo: ${formatarReais(centavos)} por peça.`,
        description: "Vale para as próximas reservas.",
        type: "success",
      });
      return;
    }
    if (resultado?.erro === "dados_invalidos") {
      formPreco.setError("preco", { message: traduzirErro(resultado.erro) }, { shouldFocus: true });
      return;
    }
    avisarErro(resultado?.erro);
  }

  async function enviarTotal({ total: novo }: SaidaTotal) {
    const erroDeEstoque = (n: number) => {
      formTotal.setError(
        "total",
        { message: traduzirErro("estoque_abaixo_do_reservado", n) },
        { shouldFocus: true },
      );
    };

    if (novo < resumo.reservadas) {
      erroDeEstoque(resumo.reservadas);
      return;
    }

    const resultado = await chamar(() => definirEstoqueTotal({ total: novo }));

    if (resultado?.ok) {
      formTotal.reset({ total: String(novo) });
      toast.add({
        title: novo === 1 ? "Total salvo: 1 queijo." : `Total salvo: ${novo} queijos.`,
        type: "success",
      });
      return;
    }
    // Alguém reservou enquanto ela digitava: o banco diz quantas estão reservadas agora.
    if (resultado?.erro === "estoque_abaixo_do_reservado") {
      erroDeEstoque(resultado.n ?? resumo.reservadas);
      router.refresh();
      return;
    }
    if (resultado?.erro === "dados_invalidos" || resultado?.erro === "quantidade_invalida") {
      formTotal.setError("total", { message: traduzirErro(resultado.erro) }, { shouldFocus: true });
      return;
    }
    avisarErro(resultado?.erro);
  }

  return {
    dados: {
      aberta,
      resumo: resumoDaVenda(resumo),
      estoque: textoDoEstoque(resumo.reservadas, resumo.disponivel, totalDigitado ?? ""),
      abertas,
      estadoAbertura: abertura.estado,
      ajudaAbertura: abertura.ajuda,
      vendendo: abertura.vendendo,
      precoAlterado,
      totalAlterado,
      salvandoPreco,
      salvandoTotal,
    },
    campos: {
      preco: ligarCampo(preco),
      total: ligarCampo(total),
    },
    acoes: {
      alternar: setAberta,
      salvarPreco(evento) {
        iniciarPreco(() => formPreco.handleSubmit(enviarPreco)(evento));
      },
      salvarTotal(evento) {
        iniciarTotal(() => formTotal.handleSubmit(enviarTotal)(evento));
      },
      alternarAbertura(marcado) {
        iniciarAbertura(async () => {
          aplicarAbertas(marcado);
          const resultado = await chamar(() => definirReservasAbertas({ abertas: marcado }));
          if (resultado?.ok) {
            toast.add(
              marcado
                ? {
                    title: "Reservas reabertas.",
                    description: "A página pública voltou a aceitar reservas.",
                    type: "success",
                  }
                : {
                    title: "Reservas encerradas.",
                    description: "A página pública não aceita novas reservas.",
                    type: "success",
                  },
            );
            return;
          }
          avisarErro(resultado?.erro);
        });
      },
    },
  };
}
