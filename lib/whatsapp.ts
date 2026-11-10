// Guarda só os dígitos com DDD, sem o 55 do Brasil.
export function normalizarWhatsapp(entrada: string) {
  const digitos = entrada.replace(/\D/g, "");
  const comPais =
    (digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55");
  return comPais ? digitos.slice(2) : digitos;
}

export function whatsappValido(digitos: string) {
  return /^\d{10,11}$/.test(digitos);
}

// "(11) 98765-4321" ou "(11) 3456-7890".
export function formatarWhatsapp(digitos: string) {
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return digitos;
}

// Formata enquanto a pessoa digita.
export function mascararWhatsapp(valorDigitado: string) {
  const d = normalizarWhatsapp(valorDigitado).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function linkWhatsApp(digitos: string) {
  return `https://wa.me/55${digitos}`;
}
