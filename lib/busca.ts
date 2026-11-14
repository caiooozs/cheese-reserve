// Busca do painel por nome ou código. A vendedora digita como lembra:
// sem acento, em minúsculas, só um pedaço ("helo prado", "k7p").

const LIMITE = 80;

// Espaços repetidos viram um só; o texto fica do jeito que ela digitou.
export function limparBusca(texto: string) {
  return texto.replace(/\s+/g, " ").trim().slice(0, LIMITE);
}

function semAcentos(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// Cada pedaço digitado precisa aparecer no nome ou no código.
export function combinaComBusca(reserva: { nome: string; codigo: string }, busca: string) {
  const pedacos = semAcentos(limparBusca(busca)).split(" ").filter(Boolean);
  if (pedacos.length === 0) return true;

  const nome = semAcentos(reserva.nome);
  const codigo = reserva.codigo.toLowerCase();
  return pedacos.every((pedaco) => nome.includes(pedaco) || codigo.includes(pedaco));
}
