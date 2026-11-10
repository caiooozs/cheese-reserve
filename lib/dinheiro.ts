// Preço digitado pela vendedora ↔ centavos inteiros, só com texto.
// Nada de parseFloat: 45,90 * 100 em ponto flutuante dá 4589,999...

// Parte inteira: só dígitos, ou grupos de milhar com ponto (1.234.567).
const INTEIRO = String.raw`(\d{1,3}(?:\.\d{3})+|\d+)`;

const COM_VIRGULA = new RegExp(String.raw`^${INTEIRO},(\d{1,2})$`);
const SO_INTEIRO = new RegExp(`^${INTEIRO}$`);
// Teclado que só tem ponto: "45.90" é decimal, porque milhar teria 3 dígitos.
const PONTO_DECIMAL = /^(\d+)\.(\d{1,2})$/;

export function reaisParaCentavos(texto: string): number | null {
  const limpo = texto.replace(/\s/g, "").replace(/^R\$/i, "");

  const partes =
    limpo.match(COM_VIRGULA) ?? limpo.match(PONTO_DECIMAL) ?? limpo.match(SO_INTEIRO);
  if (!partes) {
    return null;
  }

  const inteiros = partes[1].replaceAll(".", "");
  const centavos = (partes[2] ?? "").padEnd(2, "0");
  const resultado = Number(inteiros + centavos);
  return Number.isSafeInteger(resultado) ? resultado : null;
}

// Valor inicial do campo de preço: 4590 → "45,90". Sem ponto de milhar,
// que só atrapalha quem edita o número.
export function centavosParaCampo(centavos: number) {
  const reais = Math.trunc(centavos / 100);
  const resto = String(centavos % 100).padStart(2, "0");
  return `${reais},${resto}`;
}
