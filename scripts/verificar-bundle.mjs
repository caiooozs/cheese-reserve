// Confere, depois do `npm run build`, que a URL e a chave do Supabase não foram
// parar no JavaScript do navegador (research R8). Node puro, sem dependências.
// Imprime só nomes de arquivos, nunca os valores.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = process.cwd();
const PASTA = join(RAIZ, ".next", "static");
const NOMES = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"];
// O build usa o .env.local (e o de produção); o de desenvolvimento entra por
// garantia, para pegar também os valores do stack local.
const ARQUIVOS_ENV = [".env.production.local", ".env.local", ".env.development.local"];
const PREFIXO_PROIBIDO = "NEXT_PUBLIC_SUPABASE";

function lerEnv(arquivo) {
  const caminho = join(RAIZ, arquivo);
  if (!existsSync(caminho)) return {};
  const valores = {};
  for (const linha of readFileSync(caminho, "utf8").split(/\r?\n/)) {
    const m = linha.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) valores[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2").trim();
  }
  return valores;
}

// Valores a procurar: do ambiente e dos arquivos .env, sem repetir.
const procurados = new Map();
function guardar(nome, valor, origem) {
  if (valor && valor.length >= 8 && !procurados.has(valor)) {
    procurados.set(valor, `${nome} (${origem})`);
  }
}
for (const nome of NOMES) guardar(nome, process.env[nome], "ambiente");
for (const arquivo of ARQUIVOS_ENV) {
  const valores = lerEnv(arquivo);
  for (const nome of NOMES) guardar(nome, valores[nome], arquivo);
}

if (procurados.size === 0) {
  console.error(
    `Nenhum valor de ${NOMES.join(" ou ")} encontrado no ambiente nem em ${ARQUIVOS_ENV.join(", ")}: não há o que conferir.`,
  );
  process.exit(1);
}
if (!existsSync(PASTA)) {
  console.error("Pasta .next/static não encontrada. Rode `npm run build` antes.");
  process.exit(1);
}

function arquivosDe(pasta) {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    return statSync(caminho).isDirectory() ? arquivosDe(caminho) : [caminho];
  });
}

const problemas = [];
const arquivos = arquivosDe(PASTA);
for (const arquivo of arquivos) {
  const conteudo = readFileSync(arquivo, "utf8");
  const nomeRelativo = relative(RAIZ, arquivo).replaceAll("\\", "/");
  for (const [valor, rotulo] of procurados) {
    if (conteudo.includes(valor)) problemas.push(`${nomeRelativo}: contém o valor de ${rotulo}`);
  }
  if (conteudo.includes(PREFIXO_PROIBIDO)) {
    problemas.push(`${nomeRelativo}: contém o texto ${PREFIXO_PROIBIDO}`);
  }
}

if (problemas.length > 0) {
  console.error("O bundle do navegador expõe configuração do Supabase:");
  for (const problema of problemas) console.error(`  - ${problema}`);
  process.exit(1);
}

console.log(
  `Bundle limpo: ${arquivos.length} arquivos em .next/static, nenhum dos ${procurados.size} valores do Supabase nem ${PREFIXO_PROIBIDO}.`,
);
