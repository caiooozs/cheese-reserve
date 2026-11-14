import { formatarWhatsapp } from "@/lib/whatsapp";

// Chave Pix mostrada no comprovante. Provisória: o responsável pediu em
// 2026-11-14, contrariando a FR-015 (nada de Pix na parte pública). Para tirar,
// apague este arquivo e o bloco Pix de components/comprovante/.
export const PIX = {
  // Celular com DDD: é o que o cliente cola no app do banco.
  chave: "81993651001",
  tipo: "celular",
} as const;

export function chavePixFormatada() {
  return formatarWhatsapp(PIX.chave);
}
