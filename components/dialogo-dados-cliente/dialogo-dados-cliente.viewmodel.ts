import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  useController,
  useForm,
  useFormState,
  type FieldPath,
  type UseControllerReturn,
} from "react-hook-form";
import {
  schemaDadosFormulario,
  valoresIniciais,
  type CampoDados,
  type DialogoDadosViewProps,
  type EntradaDados,
  type SaidaDados,
} from "@/components/dialogo-dados-cliente/dialogo-dados-cliente.model";
import type { ControleDialogo } from "@/components/linha-reserva/linha-reserva.model";
import { toast } from "@/components/ui/toast";
import { MENSAGEM_GENERICA, traduzirErro } from "@/lib/erros";
import type { ReservaPainelDTO } from "@/lib/tipos";
import { mascararWhatsapp } from "@/lib/whatsapp";
import { corrigirDados } from "@/service/reservas/reservas.actions";

function ligarCampo<Nome extends FieldPath<EntradaDados>>({
  field,
  fieldState,
}: UseControllerReturn<EntradaDados, Nome>): CampoDados {
  return {
    input: {
      name: field.name,
      value: String(field.value ?? ""),
      ref: field.ref,
      onBlur: field.onBlur,
      onChange: field.onChange,
    },
    erro: fieldState.error?.message,
  };
}

export function useDialogoDadosViewModel(
  reserva: ReservaPainelDTO,
  controle: ControleDialogo,
): DialogoDadosViewProps {
  const router = useRouter();
  const [salvando, iniciar] = useTransition();

  const form = useForm<EntradaDados, unknown, SaidaDados>({
    resolver: zodResolver(schemaDadosFormulario),
    defaultValues: valoresIniciais(reserva),
  });
  const { control } = form;
  const nome = useController({ name: "nome", control });
  const whatsapp = useController({ name: "whatsapp", control });
  const endereco = useController({ name: "endereco", control });
  const { isDirty } = useFormState({ control });

  async function enviar(dados: SaidaDados) {
    let resultado;
    try {
      resultado = await corrigirDados({ id: reserva.id, ...dados });
    } catch {
      toast.add({ title: MENSAGEM_GENERICA, type: "error" });
      return;
    }

    if (resultado.ok) {
      toast.add({
        title: "Dados corrigidos.",
        description: `Reserva ${reserva.codigo}, de ${dados.nome}.`,
        type: "success",
      });
      controle.aoMudarAberto(false);
      return;
    }

    toast.add({ title: traduzirErro(resultado.erro), type: "error" });
    // Cancelada noutra aba ou sessão vencida: a lista precisa vir de novo.
    if (resultado.erro === "reserva_cancelada") {
      controle.aoMudarAberto(false);
    }
    if (resultado.erro !== "dados_invalidos") {
      router.refresh();
    }
  }

  const campoWhatsapp = ligarCampo(whatsapp);

  return {
    dados: {
      aberto: controle.aberto,
      descricao: `Reserva ${reserva.codigo}. Código, quantidade, valores e situação não mudam.`,
      alterado: isDirty,
      salvando,
    },
    campos: {
      nome: ligarCampo(nome),
      whatsapp: {
        ...campoWhatsapp,
        input: {
          ...campoWhatsapp.input,
          onChange: (evento) => whatsapp.field.onChange(mascararWhatsapp(evento.target.value)),
        },
      },
      endereco: ligarCampo(endereco),
    },
    acoes: {
      mudarAberto: controle.aoMudarAberto,
      terminarTransicao(aberto) {
        if (!aberto) controle.aoTerminar();
      },
      salvar(evento) {
        iniciar(() => form.handleSubmit(enviar)(evento));
      },
    },
  };
}
