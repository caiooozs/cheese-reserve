import { describe, expect, it } from "vitest";
import {
  formatarWhatsapp,
  linkWhatsApp,
  mascararWhatsapp,
  normalizarWhatsapp,
  whatsappValido,
} from "@/lib/whatsapp";

describe("normalizarWhatsapp", () => {
  it.each([
    ["(11) 98765-4321", "11987654321"],
    ["+55 11 98765-4321", "11987654321"],
    ["5511987654321", "11987654321"],
    ["55 11 3456-7890", "1134567890"],
    // DDD 55 (RS) com 11 dígitos não perde o começo.
    ["(55) 99123-4567", "55991234567"],
  ])("%s → %s", (entrada, esperado) => {
    expect(normalizarWhatsapp(entrada)).toBe(esperado);
  });
});

describe("whatsappValido", () => {
  it("aceita 10 ou 11 dígitos", () => {
    expect(whatsappValido("11987654321")).toBe(true);
    expect(whatsappValido("1134567890")).toBe(true);
  });

  it("recusa 9 dígitos", () => {
    expect(whatsappValido(normalizarWhatsapp("987654321"))).toBe(false);
  });

  it("recusa 12 dígitos sem o 55 na frente", () => {
    expect(whatsappValido(normalizarWhatsapp("119876543210"))).toBe(false);
  });
});

describe("formatarWhatsapp", () => {
  it("formata celular e fixo", () => {
    expect(formatarWhatsapp("11987654321")).toBe("(11) 98765-4321");
    expect(formatarWhatsapp("1134567890")).toBe("(11) 3456-7890");
  });
});

describe("mascararWhatsapp", () => {
  it.each([
    ["", ""],
    ["1", "(1"],
    ["11", "(11"],
    ["119876", "(11) 9876"],
    ["1198765", "(11) 9876-5"],
    ["1198765432", "(11) 9876-5432"],
    ["11987654321", "(11) 98765-4321"],
    ["119876543219", "(11) 98765-4321"],
    ["+55 11 98765-4321", "(11) 98765-4321"],
  ])("%s → %s", (digitado, esperado) => {
    expect(mascararWhatsapp(digitado)).toBe(esperado);
  });
});

describe("linkWhatsApp", () => {
  it("monta o link com o 55", () => {
    expect(linkWhatsApp("11987654321")).toBe("https://wa.me/5511987654321");
  });
});
