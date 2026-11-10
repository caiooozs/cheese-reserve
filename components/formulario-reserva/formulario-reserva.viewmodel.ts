import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import {
  useController,
  useForm,
  type FieldPath,
  type UseControllerReturn,
} from "react-hook-form";
import {
  estadoDaVitrine,
  quantidadeMaxima,
  schemaReservaFormulario,
  VALORES_INICIAIS,
  type AcoesFormulario,
  type CampoFormulario,
  type EntradaFormulario,
  type FormularioReservaViewProps,
  type SaidaFormulario,
} from "@/components/formulario-reserva/formulario-reserva.model";
import { toast } from "@/components/ui/toast";
import { MENSAGEM_GENERICA, traduzirErro } from "@/lib/erros";
import { formatarPecas, formatarReais } from "@/lib/formatacao";
import type { ComprovanteDTO, VitrineDTO } from "@/lib/tipos";
import { mascararWhatsapp } from "@/lib/whatsapp";
import { reservar } from "@/service/reservas/reservas.actions";

function ligarCampo<Nome extends FieldPath<EntradaFormulario>>({
  field,
  fieldState,
}: UseControllerReturn<EntradaFormulario, Nome>): CampoFormulario {
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

// Fica acima do formulário e do comprovante: quando a última peça é reservada,
// a página atualiza para "esgotou", e o comprovante de quem reservou não some.
export function useFormularioReservaViewModel(
  vitrine: VitrineDTO,
): FormularioReservaViewProps {
  // Números que vieram de um erro; valem até a próxima reserva concluída.
  const [vitrineDoErro, setVitrineDoErro] = useState<VitrineDTO | null>(null);
  const [comprovante, setComprovante] = useState<ComprovanteDTO | null>(null);
  const [recebida, setRecebida] = useState(false);
  const [precoMudou, setPrecoMudou] = useState(false);
  const [enviando, iniciarEnvio] = useTransition();
  const chaveEnvio = useRef<string | null>(null);

  const vitrineAtual = vitrineDoErro ?? vitrine;
  const maximo = quantidadeMaxima(vitrineAtual);

  const form = useForm<EntradaFormulario, unknown, SaidaFormulario>({
    resolver: zodResolver(schemaReservaFormulario(vitrineAtual.disponivel)),
    defaultValues: VALORES_INICIAIS,
  });
  const { control } = form;

  const nome = useController({ name: "nome", control });
  const whatsapp = useController({ name: "whatsapp", control });
  const quantidade = useController({ name: "quantidade", control });
  const endereco = useController({ name: "endereco", control });

  const pecas = quantidade.field.value;
  const pecasValidas = Number.isInteger(pecas) && pecas >= 1;

  function concluir(novo: ComprovanteDTO | null) {
    chaveEnvio.current = null;
    form.reset(VALORES_INICIAIS);
    setPrecoMudou(false);
    setVitrineDoErro(null);
    setComprovante(novo);
    setRecebida(novo === null);
  }

  async function submeter(dados: SaidaFormulario, site: string) {
    // A chave só é renovada depois de concluir: repetir o envio não duplica a reserva.
    chaveEnvio.current ??= crypto.randomUUID();

    try {
      const resultado = await reservar({
        ...dados,
        precoEsperadoCentavos: vitrineAtual.precoCentavos,
        chaveEnvio: chaveEnvio.current,
        site,
      });

      if (resultado.ok) {
        concluir(resultado.comprovante);
        return;
      }

      if (resultado.erro === "validacao") {
        for (const [campo, message] of Object.entries(resultado.campos)) {
          form.setError(campo as keyof typeof resultado.campos, { message });
        }
        return;
      }

      if (!resultado.vitrine) {
        toast.add({ title: traduzirErro(resultado.erro), type: "error" });
        return;
      }

      setVitrineDoErro(resultado.vitrine);
      if (resultado.erro === "preco_alterado") {
        setPrecoMudou(true);
      } else if (resultado.erro === "estoque_insuficiente") {
        form.setError("quantidade", {
          message: `Não há peças suficientes. Disponível agora: ${formatarPecas(resultado.vitrine.disponivel)}.`,
        });
      }
    } catch {
      // Sem resposta do servidor: a mesma chave protege a nova tentativa.
      toast.add({ title: MENSAGEM_GENERICA, type: "error" });
    }
  }

  const acoes: AcoesFormulario = {
    enviar(evento) {
      // Lido do DOM: robôs costumam preencher o campo sem disparar eventos.
      const armadilha = new FormData(evento.currentTarget).get("site");
      iniciarEnvio(() =>
        form.handleSubmit((dados) => submeter(dados, String(armadilha ?? "")))(evento),
      );
    },
    diminuir: () => quantidade.field.onChange(pecas - 1),
    aumentar: () => quantidade.field.onChange(pecasValidas ? pecas + 1 : 1),
    novaReserva: () => setComprovante(null),
  };

  const campoWhatsapp = ligarCampo(whatsapp);
  const campoQuantidade = ligarCampo(quantidade);

  return {
    dados: {
      estado: estadoDaVitrine(vitrineAtual),
      comprovante,
      recebida,
      enviando,
      preco: formatarReais(vitrineAtual.precoCentavos),
      disponibilidade: `${formatarPecas(vitrineAtual.disponivel)} ${
        vitrineAtual.disponivel === 1 ? "disponível" : "disponíveis"
      }`,
      limite: `Até ${formatarPecas(maximo)} por reserva.`,
      total: pecasValidas ? formatarReais(pecas * vitrineAtual.precoCentavos) : null,
      poucasPecas: vitrineAtual.disponivel <= 3,
      conta: pecasValidas
        ? `${formatarPecas(pecas)} × ${formatarReais(vitrineAtual.precoCentavos)}`
        : null,
      precoNovo: precoMudou ? formatarReais(vitrineAtual.precoCentavos) : null,
      podeDiminuir: pecasValidas && pecas > 1,
      podeAumentar: !pecasValidas || pecas < maximo,
    },
    campos: {
      nome: ligarCampo(nome),
      whatsapp: {
        ...campoWhatsapp,
        input: {
          ...campoWhatsapp.input,
          onChange: (evento) =>
            whatsapp.field.onChange(mascararWhatsapp(evento.target.value)),
        },
      },
      quantidade: {
        ...campoQuantidade,
        input: {
          ...campoQuantidade.input,
          value: Number.isNaN(pecas) ? "" : String(pecas),
          onChange(evento) {
            const digitos = evento.target.value.replace(/\D/g, "");
            quantidade.field.onChange(digitos ? Number(digitos) : Number.NaN);
          },
        },
      },
      endereco: ligarCampo(endereco),
    },
    acoes,
  };
}
