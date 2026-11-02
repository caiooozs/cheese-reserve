import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integracao",
          include: ["tests/integracao/**/*.test.ts"],
          fileParallelism: false,
          testTimeout: 20_000,
          // Prefixo próprio: o Vite também carrega o .env.local, que aponta para produção.
          env: loadEnv("test", process.cwd(), "TESTE_"),
        },
      },
    ],
  },
});
