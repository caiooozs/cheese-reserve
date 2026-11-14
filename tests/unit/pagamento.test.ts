import { describe, expect, it } from "vitest";
import { chavePixFormatada, PIX } from "@/lib/pagamento";

describe("chave Pix do comprovante", () => {
  it("é um celular com DDD, mostrado com máscara", () => {
    expect(PIX).toEqual({ chave: "81993651001", tipo: "celular" });
    expect(chavePixFormatada()).toBe("(81) 99365-1001");
  });
});
