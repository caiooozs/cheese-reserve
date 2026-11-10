// DTOs que o servidor entrega ao navegador (contracts/server-actions.md).
// Nunca a linha inteira do banco.

export type VitrineDTO = {
  precoCentavos: number; // 0 = ainda não abriram
  disponivel: number;
  reservasAbertas: boolean;
};

export type ComprovanteDTO = {
  codigo: string;
  nome: string;
  quantidade: number;
  valorTotalCentavos: number;
  endereco: string | null;
  criadaEm: string; // ISO
};

export type ReservaPainelDTO = {
  id: string;
  codigo: string;
  nome: string;
  whatsapp: string; // só dígitos, sem 55
  endereco: string | null;
  quantidade: number;
  valorTotalCentavos: number;
  criadaEm: string;
  statusPagamento: "pendente" | "pago";
  statusEntrega: "pendente" | "entregue";
  cancelada: boolean;
};

export type ResumoPainelDTO = {
  recebidoCentavos: number;
  aReceberCentavos: number;
  precoCentavos: number;
  disponivel: number;
  reservadas: number;
  total: number; // disponivel + reservadas
  reservasAbertas: boolean;
};

export type ResultadoAcao =
  | { ok: true }
  | { ok: false; erro: string; n?: number };

export type EstadoVitrine = "nao_abriu" | "encerrada" | "esgotada" | "aberta";

export type CodigoErroPublico =
  | "quantidade_invalida"
  | "venda_fechada"
  | "reservas_encerradas"
  | "preco_alterado"
  | "estoque_insuficiente"
  | "codigo_indisponivel"
  | "dados_invalidos"
  | "erro_inesperado";

export type CampoReserva = "nome" | "whatsapp" | "quantidade" | "endereco";

export type ResultadoReserva =
  | { ok: true; comprovante: ComprovanteDTO }
  | { ok: true; comprovante: null }
  | { ok: false; erro: "validacao"; campos: Partial<Record<CampoReserva, string>> }
  | { ok: false; erro: CodigoErroPublico; vitrine?: VitrineDTO };
