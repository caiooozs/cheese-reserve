// "k7p 2xq" → "K7P2XQ": a vendedora digita o código como estiver no comprovante.
export function normalizarCodigoBusca(texto: string) {
  return texto.replace(/\s/g, "").toUpperCase();
}
