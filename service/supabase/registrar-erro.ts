import "server-only";

// Só código e mensagem: `details` e `hint` podem repetir a linha inteira,
// com nome, WhatsApp e endereço do cliente.
export function registrarErro(contexto: string, erro: unknown) {
  const { code, message } = (erro ?? {}) as { code?: unknown; message?: unknown };
  console.error(`[${contexto}]`, { code, message });
}
