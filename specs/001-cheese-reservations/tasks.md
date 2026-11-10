---

description: "Lista de tarefas da feature Reserva de Queijos de Fim de Ano"
---

# Tasks: Reserva de Queijos de Fim de Ano

**Input**: Design documents from `specs/001-cheese-reservations/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: incluídos. O usuário pediu Vitest unitário e de integração no plano, e a constituição
exige verificação reproduzível de estoque, valores e permissões.

**Organization**: tarefas agrupadas por história de usuário, para cada uma ser implementada e
testada de forma independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem depender de tarefa incompleta)
- **[Story]**: história da spec (US1, US2, US3, US4)
- Caminhos relativos à raiz do repositório (projeto único Next.js, sem `src/`)

## Regras que valem para todas as tarefas

- Antes de escrever código do Next.js, ler o guia correspondente em `node_modules/next/dist/docs/`
  (exigência do `AGENTS.md`). `next.config.ts` tem `cacheComponents: true`: leitura de
  `cookies()`, `searchParams` ou dados sem cache só dentro de `<Suspense>`.
- Nenhum client do Supabase no navegador; nenhuma variável `NEXT_PUBLIC_`; só
  `service/supabase/clientes.ts` lê `process.env` (exceção: `proxy.ts`).
- Todo texto visível em português do Brasil, linguagem simples; dinheiro em centavos inteiros;
  datas em `America/Sao_Paulo`.
- Mensagens de erro: tabela de [contracts/server-actions.md](./contracts/server-actions.md#mensagens-de-erro).
- Telas pensadas para 360 px de largura; alvos de toque com pelo menos 44×44 px.
- **Arquitetura** ([research R15](./research.md#r15-mvvm-com-services-e-containers)): todo acesso
  ao Supabase fica em `service/<domínio>/<domínio>.service.ts`, e as Server Actions em
  `service/<domínio>/<domínio>.actions.ts`. Toda tela cliente com estado ou chamada a action tem a
  pasta `components/<nome>/` com `<nome>.container.tsx`, `<nome>.view.tsx`,
  `<nome>.viewmodel.ts` e `<nome>.model.ts`. O ViewModel devolve `{ dados, campos, acoes }` e é
  o único que chama actions; a View só recebe essas props; o container liga os dois. A leitura
  continua em Server Components, que chamam o service. Isso vale para todas as tarefas de tela
  abaixo. Actions devolvem códigos de erro, e o ViewModel traduz com `traduzirErro`.
- **Interface:** todo trabalho de interface usa as skills `/impeccable:impeccable` e
  `/design-taste-frontend`, carregadas antes de escrever a tela.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: dependências, configuração de testes, variáveis e casca do layout

- [X] T001 Instalar dependências e scripts em `package.json`: `npm install server-only` e `npm install -D vitest supabase`; adicionar os scripts `"test:unit": "vitest run --project unit"`, `"test:integracao": "vitest run --project integracao"` e `"verificar-bundle": "node scripts/verificar-bundle.mjs"`. Não instalar Sonner nem Playwright (research R10 e R13)
- [X] T002 [P] Criar `vitest.config.mts` com `test.projects` = `unit` (`include: ['tests/unit/**/*.test.ts']`, `environment: 'node'`) e `integracao` (`include: ['tests/integracao/**/*.test.ts']`, `environment: 'node'`, `fileParallelism: false`, `testTimeout: 20000`, `env` carregado com `loadEnv('test', process.cwd(), 'TESTE_')` do Vite); `resolve.alias` `'@'` → raiz do repositório (sem plugin novo)
- [X] T003 [P] Em `.env.local`, renomear `NEXT_PUBLIC_SUPABASE_URL` → `SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `SUPABASE_PUBLISHABLE_KEY`, mantendo os valores e sem exibi-los; confirmar que `grep NEXT_PUBLIC .env.local` não retorna nada (research R8)
- [X] T004 [P] Criar `lib/produto.ts` exportando `PRODUTO = { nome: 'Queijo artesanal', descricao: 'Queijo feito à mão para as festas de fim de ano. Vendido por peça.' }` (texto editável pelo responsável) e atualizar `app/layout.tsx`: `lang="pt-BR"`, `metadata` com `title` e `description` vindos de `PRODUTO`, `openGraph` (`title`, `description`, `locale: 'pt_BR'`, `type: 'website'`; `images` só se existir `public/og.jpg`), removendo os textos "Create Next App"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: banco versionado e ajustado à spec, banco local de testes, fronteira servidor/cliente
e funções puras usadas por todas as histórias

**⚠️ CRITICAL**: nenhuma história começa antes desta fase terminar

### Banco

- [X] T005 Rodar `npx supabase init` (cria `supabase/config.toml` e `supabase/.gitignore`); em `supabase/config.toml` definir `enable_signup = false` só em `[auth]`, espelhando produção. Em `[auth.email]` fica `true`: ali o valor liga o provedor de e-mail inteiro, e desligar impede também o login
- [X] T006 Registrar a baseline e conferir contra o remoto. A baseline são os arquivos que o usuário rodou no SQL Editor, colocados exatamente como executados: `supabase/migrations/20261029180000_tabelas.sql`, `20261029180100_funcoes.sql` e `20261029180200_rls_e_permissoes.sql` (não editar depois). Com `npx supabase login` (usuário) e `npx supabase link --project-ref <ref>`, rodar `npx supabase migration repair --status applied 20261029180000 20261029180100 20261029180200`; com o Docker rodando, `npx supabase db diff --linked --schema public`, sem a migration de ajustes na pasta, não pode mostrar nada além do ruído de CRLF nos corpos das functions (resultado em research.md, "Resultado da verificação da baseline")
- [X] T007 Conferir a baseline (os três arquivos do T006) contra os itens V1–V10 de research R1 e registrar o resultado (✅/❌ por item) numa seção nova "Resultado da verificação da baseline" em `specs/001-cheese-reservations/research.md`, anotando também: assinatura exata e grants de `criar_reserva` e `obter_vitrine`; tipo de `reservas.id`; tipo dos status (enum ou `text` + `CHECK`); como as políticas checam admin; chave da linha única de `configuracao`; `CHECK`s existentes em `nome`, `whatsapp` e `endereco`; nomes das políticas de `UPDATE`
- [X] T008 Criar `supabase/migrations/<timestamp>_ajustes_spec.sql` com `npx supabase migration new ajustes_spec`, contendo (research R2–R5, [data-model.md](./data-model.md), [contracts/banco-rpc.md](./contracts/banco-rpc.md)). Toda function nova ou recriada usa `SECURITY DEFINER`, `SET search_path = ''`, nomes qualificados (`public.`, `extensions.`) e `REVOKE ALL ON FUNCTION ... FROM PUBLIC` antes do `GRANT`:
  - `configuracao.reservas_abertas` `boolean` "`NOT NULL DEFAULT true`"
  - `reservas.chave_envio` `uuid NULL`, "`UNIQUE` (índice parcial `WHERE chave_envio IS NOT NULL`)"
  - `DROP FUNCTION public.obter_vitrine()` e recriar retornando `TABLE(preco_centavos integer, estoque_disponivel integer, reservas_abertas boolean)`; `GRANT EXECUTE` para `anon` e os mesmos papéis da baseline
  - `DROP FUNCTION` da assinatura antiga de `criar_reserva` (anotada no T007) e recriar como `criar_reserva(p_nome text, p_whatsapp text, p_quantidade integer, p_preco_esperado_centavos integer, p_chave_envio uuid, p_endereco text DEFAULT NULL)` (endereço por último, com padrão, para poder ser omitido na chamada) retornando `TABLE(codigo text, quantidade integer, valor_total_centavos integer, criada_em timestamptz)`, nesta ordem: (1) `SELECT ... FROM public.configuracao ... FOR UPDATE`; (2) se `p_chave_envio` já existe em `reservas`, devolver essa reserva sem efeito; (3) `p_quantidade` fora de 1–10 → `quantidade_invalida`; (4) `preco_centavos = 0` → `venda_fechada`; (5) `NOT reservas_abertas` → `reservas_encerradas`; (6) `preco_centavos <> p_preco_esperado_centavos` → `preco_alterado`; (7) `estoque_disponivel < p_quantidade` → `estoque_insuficiente`; (8) `btrim(p_nome)` fora de 2–80, `p_whatsapp !~ '^[0-9]{10,11}$'` ou endereço com mais de 200 caracteres → `dados_invalidos`; (9) descontar o estoque, gerar o código com `public.gerar_codigo_reserva()` (manter o tratamento de colisão da baseline e o erro `codigo_indisponivel`) e inserir com `nome = btrim(p_nome)`, `endereco = nullif(btrim(p_endereco), '')`, `preco_unitario_centavos = preco_centavos`, `chave_envio = p_chave_envio`. `GRANT EXECUTE` para `anon` e os mesmos papéis da baseline
  - `public.definir_estoque_total(p_total integer)` retornando `TABLE(estoque_disponivel integer, pecas_reservadas integer)`: não admin → `nao_autorizado`; `p_total < 0` → `quantidade_invalida`; travar `configuracao` com `FOR UPDATE`; somar `quantidade` das reservas com `cancelada_em IS NULL`; `p_total < soma` → `estoque_abaixo_do_reservado`; senão `estoque_disponivel = p_total - soma`. `GRANT EXECUTE` para `authenticated`
  - Checagem de admin: usar a `public.is_admin()` da baseline (já executável por `authenticated`); não criar `eh_admin()`
  - Grants por coluna: `REVOKE UPDATE ON public.configuracao FROM authenticated` + `GRANT UPDATE (preco_centavos, reservas_abertas) ON public.configuracao TO authenticated`; `REVOKE UPDATE ON public.reservas FROM authenticated` + `GRANT UPDATE (status_pagamento, status_entrega, nome, whatsapp, endereco) ON public.reservas TO authenticated`; `REVOKE ALL ON public.configuracao, public.reservas, public.admins FROM anon` e `REVOKE ALL ON public.totais_venda FROM anon`
  - Política de `UPDATE` em `reservas` só para admin e com "`cancelada_em IS NULL`" no `USING` e no `WITH CHECK` (criar ou ajustar conforme o T007)
  - `CHECK`s que faltarem (V8): nome "2–80 caracteres após `trim`" (`char_length(btrim(nome)) BETWEEN 2 AND 80`), whatsapp "só dígitos, 10 ou 11" (`whatsapp ~ '^[0-9]{10,11}$'`), endereço "até 200 caracteres" (`endereco IS NULL OR char_length(endereco) <= 200`). Se houver dados de teste no remoto que violem os `CHECK`s, limpá-los na mesma migration
  - `CREATE OR REPLACE VIEW public.totais_venda` mantendo as colunas atuais na mesma ordem e acrescentando no fim `pecas_reservadas` (soma de `quantidade` com `cancelada_em IS NULL`, `0` quando vazio), preservando `security_invoker`/grants da baseline
  - Corrigir aqui qualquer ❌ registrado no T007
- [X] T009 [P] Criar `supabase/seed.sql` (só local; não vai para o remoto): garantir a linha única de `configuracao` (chave anotada no T007) com `preco_centavos = 5000`, `estoque_disponivel = 20`, `reservas_abertas = true`; criar dois usuários em `auth.users` com ids fixos `00000000-0000-0000-0000-0000000000a1` (`admin@teste.local`) e `00000000-0000-0000-0000-0000000000b2` (`comum@teste.local`), senha `senha-teste-123` via `extensions.crypt(..., extensions.gen_salt('bf'))`, `aud`/`role` `'authenticated'`, `instance_id` `'00000000-0000-0000-0000-000000000000'`, `email_confirmed_at = now()`, `raw_app_meta_data = '{"provider":"email","providers":["email"]}'` e as colunas de token (`confirmation_token`, `recovery_token`, `email_change_token_new`, `email_change`) como `''`; criar as linhas correspondentes em `auth.identities` (`provider = 'email'`, `provider_id` = id do usuário, `identity_data` com `sub`, `email` e `email_verified: true`); inserir só o admin em `public.admins`
- [X] T010 Aplicar localmente: `npx supabase start` e `npx supabase db reset` sem erros (baseline + ajustes + seed); gerar os tipos com `npx supabase gen types typescript --local > lib/database.types.ts`
- [X] T011 Criar `.env.development.local` com `SUPABASE_URL=http://127.0.0.1:54321` e `SUPABASE_PUBLISHABLE_KEY` local, e `.env.test.local` com `TESTE_SUPABASE_URL` e `TESTE_SUPABASE_PUBLISHABLE_KEY` com os mesmos valores (de `npx supabase status -o env`: `API_URL` e `PUBLISHABLE_KEY`, ou `ANON_KEY` em CLIs antigas). Assim `npm run dev` usa o banco local. Os dois arquivos já estão cobertos por `.env*` no `.gitignore`
- [X] T012 [P] Criar `tests/integracao/helpers.ts`: lê `TESTE_SUPABASE_URL`/`TESTE_SUPABASE_PUBLISHABLE_KEY` e aborta se a URL não começar com `http://127.0.0.1` ou `http://localhost` (proteção contra rodar no remoto); exporta `clienteAnon()`, `clienteAdmin()` (login `admin@teste.local`), `clienteComum()` (login `comum@teste.local`), todos `createClient<Database>` com `persistSession: false`; `prepararVenda({ precoCentavos, total, abertas })` como admin: cancela todas as reservas ativas com `cancelar_reserva`, atualiza `preco_centavos` e `reservas_abertas` e chama `definir_estoque_total(total)`; e `reservar(cliente, parciais?)`, que chama `criar_reserva` com valores padrão válidos, `p_preco_esperado_centavos` lido de `obter_vitrine` e `p_chave_envio = crypto.randomUUID()`

### Fronteira servidor/cliente e funções puras

- [X] T013 [P] Criar `lib/tipos.ts` com os tipos `VitrineDTO`, `ComprovanteDTO`, `ReservaPainelDTO`, `ResumoPainelDTO`, `ResultadoAcao`, `ResultadoReserva` e `CodigoErroPublico` exatamente como em [contracts/server-actions.md](./contracts/server-actions.md#dtos-servidor--navegador)
- [X] T014 [P] Criar `server/supabase.ts` com `import 'server-only'`: `clientePublico()` = `createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })` e `clienteDaSessao()` = `createServerClient<Database>` do `@supabase/ssr` com `await cookies()` (`getAll`/`setAll`, `setAll` em `try/catch` porque Server Components não gravam cookies). Lança erro claro se faltar variável. Único módulo de `server/` que lê `process.env` (research R7)
- [X] T015 [P] Criar `server/erros.ts` com `import 'server-only'` e `registrarErro(contexto: string, erro: unknown)`, que faz `console.error` só de `{ contexto, code, message }`, nunca de `details`, `hint` ou da entrada (research R12)
- [X] T016 Criar `server/auth.ts` com `import 'server-only'`: `obterAdmin()` (usa `clienteDaSessao()`, `auth.getClaims()` e `rpc('is_admin')`; retorna `{ supabase, userId }` ou `null`) e `exigirAdmin()` (sem sessão → `redirect('/admin/login')`; sessão sem admin → `redirect('/admin/login?erro=sem-acesso')`, sem `signOut`, para não haver laço de redirecionamento)
- [X] T017 [P] Criar `proxy.ts` na raiz (Next 16; ler `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`): `export async function proxy(request: NextRequest)` com `createServerClient` usando os cookies do request e do response (padrão `updateSession` do `@supabase/ssr`), `auth.getClaims()`; sem sessão e caminho diferente de `/admin/login` → redirect para `/admin/login`; `export const config = { matcher: ['/admin/:path*'] }`. Lê `process.env.SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` direto e não importa nada de `server/`
- [X] T018 [P] Criar `lib/erros.ts` com `traduzirErro(codigo: string): string` (tabela exata de [contracts/server-actions.md](./contracts/server-actions.md#mensagens-de-erro), com `{n}` substituível por parâmetro opcional) e `MENSAGEM_GENERICA`; testes em `tests/unit/erros.test.ts` cobrindo todos os códigos, a substituição de `{n}` e o genérico para código desconhecido
- [X] T019 [P] Criar `lib/formatacao.ts` com `formatarReais(centavos)` (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`) e `formatarDataHora(iso)` → `"29/10/2026 às 15:02"` (`Intl.DateTimeFormat` com `timeZone: 'America/Sao_Paulo'` e `formatToParts`); testes em `tests/unit/formatacao.test.ts` (`10000` → `"R$ 100,00"`; `'2026-10-29T18:02:00Z'` → `"29/10/2026 às 15:02"`; virada de dia em UTC)
- [X] T020 [P] Criar `lib/whatsapp.ts`: `normalizarWhatsapp(entrada)` (remove tudo que não é dígito; tira o `55` inicial quando sobram 12 ou 13 dígitos), `whatsappValido(digitos)` (10 ou 11), `formatarWhatsapp(digitos)` (`"(11) 98765-4321"` / `"(11) 3456-7890"`), `mascararWhatsapp(valorDigitado)` (formata progressivamente enquanto digita) e `linkWhatsApp(digitos)` → `https://wa.me/55<digitos>`; testes em `tests/unit/whatsapp.test.ts` com `"(11) 98765-4321"`, `"+55 11 98765-4321"`, `"5511987654321"`, 9 dígitos (inválido) e 12 dígitos sem 55 (inválido)
- [X] T021 Criar `lib/constantes.ts` (`LIMITE_POR_RESERVA = 10`, com comentário dizendo que precisa bater com `criar_reserva`) e `lib/schemas.ts` (zod; sem `server-only`): campos `nome` (`trim`, 2–80, "Informe seu nome."), `whatsapp` (transforma com `normalizarWhatsapp`, valida 10–11, "WhatsApp inválido. Informe DDD e número."), `endereco` (`trim`, até 200, `''` → `null`), `quantidade` (inteiro de 1 até `LIMITE_POR_RESERVA`); `schemaReserva` (servidor: campos + `precoEsperadoCentavos` inteiro > 0 + `chaveEnvio` uuid + `site` string opcional) e `schemaReservaFormulario(disponivel)` (navegador: quantidade até `min(LIMITE_POR_RESERVA, disponivel)`, "Escolha de 1 a N peças."); testes em `tests/unit/schemas.test.ts` com os limites 1/2/80/81 de nome, 200/201 de endereço, 0/1/10/11 de quantidade e endereço vazio → `null`
- [X] T022 [P] Em `app/layout.tsx`, envolver `{children}` com `<Toaster>` de `components/ui/toast.tsx` (Toast do Base UI já existente; usar `toast.add({ title, type })` nas telas)

**Checkpoint**: banco local com baseline + ajustes + seed, tipos gerados, helpers de teste e
fronteira servidor/cliente prontos. As histórias podem começar.

---

## Phase 3: User Story 1 - Cliente reserva queijos pela página pública (Priority: P1) 🎯 MVP

**Goal**: o cliente abre o link, vê preço e disponibilidade, reserva e recebe o comprovante para
enviar pelo WhatsApp, sem nunca passar do estoque.

**Independent Test**: com preço e estoque já definidos (seed ou SQL), abrir `/` no celular,
reservar e conferir o comprovante, a queda do disponível e as recusas além do disponível ou do
limite de 10.

### Tests for User Story 1

- [X] T023 [P] [US1] Criar `tests/integracao/reservar.test.ts` (usa `helpers.ts`; `prepararVenda` no `beforeEach`): código retornado casa com `/^(?=.*[A-Z])(?=.*\d)[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/`; quantidade 10 aceita e 11/0 → `quantidade_invalida`; preço 0 → `venda_fechada`; `reservas_abertas = false` → `reservas_encerradas`; preço esperado diferente → `preco_alterado` sem criar nada; quantidade acima do disponível → `estoque_insuficiente`; com total 3, cinco chamadas simultâneas de 3 peças (`Promise.allSettled`) → exatamente 1 sucesso, as outras `estoque_insuficiente` e disponível 0; mesma `p_chave_envio` duas vezes → mesmo código e estoque descontado uma vez; nome com 1 caractere, WhatsApp com 9 dígitos e endereço com 201 caracteres → `dados_invalidos`; `obter_vitrine` como anon retorna só `preco_centavos`, `estoque_disponivel` e `reservas_abertas`
- [X] T024 [P] [US1] Criar `tests/integracao/permissoes-publicas.test.ts`: como `anon`, `select` em `reservas`, `configuracao`, `admins` e `totais_venda` não retorna linhas (ou dá erro de permissão); `insert`/`update`/`delete` em `reservas` e `update` em `configuracao` falham; `rpc` em `alterar_quantidade`, `cancelar_reserva`, `definir_estoque_total` e `gerar_codigo_reserva` falha por permissão

### Implementation for User Story 1

- [X] T025 [P] [US1] Criar `lib/comprovante.ts` com `textoComprovante(c: ComprovanteDTO)` no formato exato de [contracts/server-actions.md](./contracts/server-actions.md#texto-do-comprovante) ("1 peça"/"N peças"; linha `Entrega:` só com endereço; `Feita em` com `formatarDataHora`); testes em `tests/unit/comprovante.test.ts` (com e sem endereço, 1 e 2 peças, texto completo comparado linha a linha)
- [X] T026 [P] [US1] Criar `lib/vitrine.ts` com `estadoDaVitrine(v: VitrineDTO)` → `'nao_abriu' | 'encerrada' | 'esgotada' | 'aberta'` (prioridade: preço 0, depois `!reservasAbertas`, depois disponível 0) e `quantidadeMaxima(v)` = `min(LIMITE_POR_RESERVA, disponivel)`; testes em `tests/unit/vitrine.test.ts` cobrindo as combinações de prioridade
- [X] T027 [P] [US1] Criar `server/vitrine.ts` com `import 'server-only'` e `obterVitrine(): Promise<VitrineDTO>` via `clientePublico().rpc('obter_vitrine')` (aceitar retorno em lista ou objeto), mapeando para `{ precoCentavos, disponivel, reservasAbertas }`; em erro, `registrarErro` e relançar
- [X] T028 [US1] Criar `server/reservas.ts` com `import 'server-only'` e `criarReserva(dados)` (dados já validados por `schemaReserva`): `clientePublico().rpc('criar_reserva', { p_nome, p_whatsapp, p_quantidade, p_endereco, p_preco_esperado_centavos, p_chave_envio })`; sucesso → `{ ok: true, comprovante: ComprovanteDTO }` (nome e endereço da entrada normalizada, demais campos do retorno); erro → `{ ok: false, codigo: error.message }` e `registrarErro`
- [X] T029 [US1] Criar `app/actions.ts` com `'use server'` e `reservar(entrada: unknown): Promise<ResultadoReserva>`: `schemaReserva.safeParse`; erros de campo → `{ ok: false, erro: 'validacao', campos }`; `site` preenchido → `{ ok: true, comprovante: null }` sem chamar o banco; chama `criarReserva`; para `preco_alterado`, `estoque_insuficiente`, `reservas_encerradas` e `venda_fechada`, anexa `vitrine` de `obterVitrine()`; mensagem com `traduzirErro`; em sucesso, `revalidatePath('/')` e `revalidatePath('/admin')`
- [X] T030 [P] [US1] Criar `app/_componentes/aviso-venda.tsx` (sem `server-only`, usável no servidor e no cliente) que recebe o estado e mostra: `nao_abriu` → "As reservas ainda não abriram. Volte em breve!"; `encerrada` → "As reservas estão encerradas. Obrigada!"; `esgotada` → "Esgotou! Todas as peças já foram reservadas."
- [X] T031 [P] [US1] Criar `app/_componentes/comprovante.tsx` (`'use client'`), recebendo `ComprovanteDTO` e `onNovaReserva`: cartão (`components/ui/card.tsx`) que cabe em 360×640, código em `font-mono` grande com espaçamento; nome, quantidade, total (`formatarReais`), "Entrega: <endereço>" ou "Entrega: combinar pelo WhatsApp", "Feita em ..."; botão "Copiar" sempre (`navigator.clipboard.writeText(textoComprovante(...))`, confirmação "Copiado!" no próprio botão, porque um toast cobriria "Fazer outra reserva" e sairia no print; se falhar, toast "Não deu para copiar. Tire um print da tela."); botão "Compartilhar" só quando `navigator.share` existir (o comprovante só aparece depois de uma ação no navegador, então não há renderização do servidor para divergir), com `AbortError` ignorado; cobre a tela inteira, para o print pegar só o comprovante; abaixo, "Envie este comprovante para a vendedora pelo WhatsApp. Ela vai responder com os dados para pagamento."; botão "Fazer outra reserva"
- [X] T032 [US1] Criar `app/_componentes/formulario-reserva.tsx` (`'use client'`), recebendo `VitrineDTO`. Mantém `vitrineAtual` em estado, e se `estadoDaVitrine` deixar de ser `aberta`, troca o formulário por `<AvisoVenda>`. React Hook Form + `zodResolver(schemaReservaFormulario(vitrineAtual.disponivel))`, campos com `Field`/`FieldLabel`/`FieldError` de `components/ui/field.tsx` e `Controller`:
  - Campos: nome (`autoComplete="name"`); WhatsApp (`inputMode="tel"`, `autoComplete="tel"`, `mascararWhatsapp` no `onChange`); quantidade (`inputMode="numeric"` com botões − e + de 44 px, entre 1 e `quantidadeMaxima`); endereço (`Textarea`, opcional, com a dica "Se não informar, a entrega é combinada pelo WhatsApp.")
  - Campo-armadilha `site`: fora da tela, `tabIndex={-1}`, `aria-hidden`, `autoComplete="off"`
  - Total em prévia: `formatarReais(quantidade * precoCentavos)`
  - `chaveEnvio`: gerada com `crypto.randomUUID()` no primeiro envio, guardada em `useRef` e renovada após sucesso
  - Envio: `startTransition(() => reservar({ ...dados, precoEsperadoCentavos: vitrineAtual.precoCentavos, chaveEnvio, site }))`, com botão desabilitado e "Reservando…" enquanto pendente
  - Resultados:
    - comprovante → mostra `<Comprovante>`
    - `comprovante: null` → "Reserva recebida."
    - `validacao` → `setError` por campo
    - `preco_alterado` → atualiza `vitrineAtual` e mostra um aviso com o novo preço e o novo total, pedindo para confirmar de novo
    - `estoque_insuficiente` → atualiza `vitrineAtual` e mostra erro no campo quantidade com "Disponível agora: N."
    - demais → toast com a mensagem
- [X] T033 [US1] Criar `app/_componentes/vitrine.tsx` (Server Component async): `await connection()`, depois `obterVitrine()`; se falhar, mostra a mensagem genérica; senão, renderiza sempre `<FormularioReserva vitrine={...} />` (só o DTO). O componente cliente fica sempre montado e é ele quem decide entre formulário, aviso e comprovante, e mostra o preço como "R$ 50,00 por peça" e a quantidade como "1 peça disponível" ou "N peças disponíveis": se o servidor trocasse o formulário pelo aviso, quem reservou a última peça perderia o comprovante quando a página atualizasse
- [X] T034 [US1] Reescrever `app/page.tsx`: casca estática mobile-first (`max-w-md`, `px-4`) com `PRODUTO.nome`, `PRODUTO.descricao` e `<Suspense fallback={<Skeleton ... />}>` envolvendo `<Vitrine />`; nenhum telefone ou chave Pix na página (FR-015)
- [X] T035 [US1] Validar US1: `npm run test:unit` e `npm run test:integracao` (`reservar`, `permissoes-publicas`) verdes; `npm run dev` (banco local) e roteiro "História 1" de `specs/001-cheese-reservations/quickstart.md` §7 em 360 px
- [X] T075 [US1] Refatorar a tela pública para MVVM ([research R15](./research.md#r15-mvvm-no-cliente)): `app/_componentes/use-reserva-view-model.ts` e `app/_componentes/use-comprovante-view-model.ts` com o estado, a formatação e a chamada de `reservar`; `formulario-reserva.tsx` e `comprovante.tsx` só desenham; campo-armadilha lido do DOM no envio
- [X] T076 [US1] Emendar `.specify/memory/constitution.md` para a v2.0.0 (arquitetura MVVM com services e containers) e atualizar `specs/001-cheese-reservations/plan.md`, `research.md`, `contracts/server-actions.md` e `tasks.md`
- [X] T077 [US1] Trocar `server/` por `service/`: `service/supabase/clientes.ts`, `service/supabase/registrar-erro.ts`, `service/auth/auth.service.ts`, `service/vitrine/vitrine.service.ts`, `service/reservas/reservas.service.ts` e `service/reservas/reservas.actions.ts` (no lugar de `app/actions.ts`), com a action devolvendo código de erro em vez de mensagem
- [X] T078 [US1] Mover a tela pública para `components/<nome>/` com container, view, viewmodel e model (`formulario-reserva`, `comprovante`), usando os grupos `dados`, `campos` e `acoes`; `estadoDaVitrine`, `quantidadeMaxima` e `schemaReservaFormulario` vão para `formulario-reserva.model.ts`, e `textoComprovante` vai para `comprovante.model.ts`; apagar `app/_componentes/`, `lib/vitrine.ts` e `lib/comprovante.ts`
- [X] T079 [US1] Reformular a página pública na direção "Cartão de Boas Festas" (`.impeccable/surfaces/app-page-tsx.md`) com `/impeccable:impeccable` e `/design-taste-frontend`: fundo verde-garrafa, folha branca, faixa de correio, selo do preço, campos como linhas de cartão postal e carimbo com a data no comprovante; saudação em `lib/produto.ts`; tokens em `app/globals.css`
- [X] T080 [US1] Validar: `npm run test:unit`, `npm run test:integracao`, `npx tsc --noEmit`, `npx eslint` e `npm run build` verdes; roteiro completo no navegador em 360×640; revisão final da skill impeccable e `DESIGN.md` gerado

**Checkpoint**: MVP. A página pública reserva com segurança contra estoque, preço e envio repetido.

---

## Phase 4: User Story 2 - Vendedora acompanha e confere as reservas (Priority: P2)

**Goal**: login da vendedora, lista com busca por código, filtros, status de pagamento e
entrega, atalho de WhatsApp e totais "Recebido" e "A receber".

**Independent Test**: com reservas existentes, entrar em `/admin`, buscar por código, alternar
pagamento e entrega, filtrar "pagas e não entregues" e conferir os totais.

### Tests for User Story 2

- [X] T036 [P] [US2] Criar `tests/integracao/painel-leitura.test.ts`: admin lê `reservas` com as colunas de `ReservaPainelDTO` e encontra por `codigo`; usuário comum recebe 0 linhas em `reservas`, `configuracao` e `totais_venda`, e um `update` em `reservas` afeta 0 linhas; admin marca pago → `totais_venda.recebido_centavos` sobe e `a_receber_centavos` desce no mesmo valor, e voltar para pendente restaura; admin não consegue mudar status de reserva cancelada (0 linhas); canceladas ficam fora dos totais; `is_admin()` é `true` para o admin e `false` para o comum

### Implementation for User Story 2

- [X] T037 [P] [US2] Criar `lib/codigo.ts` com `normalizarCodigoBusca(texto)` (maiúsculas, sem espaços); testes em `tests/unit/codigo.test.ts` (`" k7p 2xq "` → `"K7P2XQ"`)
- [X] T038 [P] [US2] Criar `service/auth/auth.actions.ts` (`'use server'`): `entrar(entrada)` valida `{ email: e-mail, senha: mín. 1 }` com zod, chama `service/auth/auth.service.ts` (que usa `clienteDaSessao().auth.signInWithPassword`); qualquer falha → `{ ok: false, erro: 'credenciais_invalidas' }`; sucesso → `redirect('/admin')`. `sair()`: `auth.signOut()` e `redirect('/admin/login')`
- [X] T039 [US2] Criar a pasta `components/formulario-login/` (container, view, viewmodel e model; RHF + zod; e-mail com `inputMode="email"` e `autoComplete="username"`; senha com `autoComplete="current-password"`; mensagem de erro da action; se `useSearchParams().get('erro') === 'sem-acesso'`, mostra "Esta conta não tem acesso ao painel.") e `app/admin/login/page.tsx` (título "Entrar no painel"; formulário dentro de `<Suspense>`)
- [X] T040 [US2] Acrescentar a `lib/schemas.ts`: `schemaFiltrosPainel` (`codigo` opcional normalizado com `normalizarCodigoBusca`; `pagamento` `'pendente' | 'pago'`; `entrega` `'pendente' | 'entregue'`; `situacao` `'ativas' | 'canceladas' | 'todas'`, padrão `'ativas'`; valores inválidos ignorados) e `schemaStatusPagamento`/`schemaStatusEntrega` (`{ id: uuid, status }`); testes em `tests/unit/schemas.test.ts`
- [X] T041 [US2] Acrescentar a `service/reservas/reservas.service.ts`: `listarReservas(supabase, filtros)` → `ReservaPainelDTO[]` com `select('id, codigo, nome, whatsapp, endereco, quantidade, valor_total_centavos, created_at, status_pagamento, status_entrega, cancelada_em')` (nunca `*`), `order('created_at', { ascending: false })`, `eq('codigo', ...)`, `situacao` (`is('cancelada_em', null)` / `not('cancelada_em', 'is', null)`) e `eq` de pagamento/entrega; `resumoPainel(supabase)` → `ResumoPainelDTO` a partir de `totais_venda` (`recebido_centavos, a_receber_centavos, pecas_reservadas`) e `configuracao` (`preco_centavos, estoque_disponivel, reservas_abertas`), com `total = disponivel + reservadas`; `definirStatus(supabase, id, campo, valor)` com `update(...).eq('id', id).select('id')`, tratando retorno vazio como `reserva_cancelada`
- [X] T042 [US2] Acrescentar a `service/reservas/reservas.actions.ts` (`'use server'`) `definirPagamento` e `definirEntrega`: `obterAdmin()` (nulo → `{ ok: false, erro: 'nao_autorizado' }`), validação zod, `definirStatus`, `revalidatePath('/admin')`; retorno `ResultadoAcao`
- [X] T043 [P] [US2] Criar `components/resumo-painel/resumo-painel.view.tsx` (sem estado): cartões "Recebido" e "A receber" (`formatarReais`) e linha de peças "Total X · Reservadas Y · Disponíveis Z"
- [X] T044 [P] [US2] Criar a pasta `components/busca-filtros/` (container, view, viewmodel e model): campo de código (normaliza com `normalizarCodigoBusca` ao digitar; envia para `?codigo=`), `NativeSelect` de `components/ui/native-select.tsx` para pagamento, entrega e situação, atualizando a URL com `useRouter`/`useSearchParams`; botão "Limpar"
- [X] T045 [US2] Criar a pasta `components/linha-reserva/` (container, view, viewmodel e model), recebendo `ReservaPainelDTO`:
  - Dados: código em `font-mono`, nome, WhatsApp formatado com botão "Abrir WhatsApp" (`linkWhatsApp`, `target="_blank"`, `rel="noopener noreferrer"`), endereço ou "Entrega a combinar", quantidade, total, data (`formatarDataHora`)
  - Interruptores "Pago" e "Entregue" (`components/ui/switch.tsx`) com `useOptimistic` + `startTransition` chamando `definirPagamento`/`definirEntrega`; toast de erro em caso de falha
  - Cancelada: badge "Cancelada", sem interruptores, visual esmaecido
- [X] T046 [US2] Criar `components/lista-reservas/lista-reservas.tsx` (Server Component) que renderiza `LinhaReserva` por item e, sem resultados, o estado vazio "Nenhuma reserva encontrada." (`components/ui/empty.tsx`)
- [X] T047 [US2] Criar `app/admin/page.tsx`: casca (título "Painel", botão "Sair" com a action `sair`) e `<Suspense fallback={...}>` envolvendo um componente async que recebe a promise `searchParams` (`PageProps<'/admin'>`), chama `exigirAdmin()`, valida os filtros com `schemaFiltrosPainel` e renderiza `<Resumo>`, `<BuscaFiltros>` e `<ListaReservas>`
- [X] T048 [US2] Validar US2: `npm run test:integracao` (`painel-leitura`) verde; roteiro "História 2" de `specs/001-cheese-reservations/quickstart.md` §7 em 360 px, com login `admin@teste.local`

- [X] T081 [US2] Desenhar o painel com `/impeccable:impeccable` e `/design-taste-frontend`: estrutura "Placar e diário da venda" escolhida pelo usuário (`.impeccable/surfaces/app-admin-page-tsx.md`), revisão final da skill e `DESIGN.md` atualizado. Ajustes que vieram da implementação: `entrar` confere se a conta é admin e devolve `sem_acesso` (sem redirecionar duas vezes); `exigirAdmin()` chama `connection()` antes de `getClaims`; a busca por código ignora `situacao`; com busca ou filtro ativo, a lista vem antes do placar

- [X] T082 Trocar a identidade visual (pedido do usuário em 2026-11-02): sair do cartão de Boas Festas para o padrão da categoria, escolhido na rodada de direção, com acabamento de Stripe Checkout (formulário) e Linear/Vercel (painel), claro e escuro automático e sem referência a fim de ano. Página pública, comprovante, login e painel, com `/impeccable:impeccable` e `/design-taste-frontend`; contratos em `.impeccable/surfaces/`; remover `cartao`, `selo`, `carimbo` e a fonte Grand Hotel; revisão final da skill e `DESIGN.md` reescrito

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Vendedora define o preço e o estoque (Priority: P3)

**Goal**: definir o preço por peça, o total de queijos (com disponível calculado) e abrir ou
encerrar as reservas pelo painel.

**Independent Test**: no painel, definir preço e total e ver a página pública aceitar reservas;
mudar o preço e conferir que reservas antigas mantêm o valor; tentar um total abaixo do
reservado; encerrar e reabrir.

### Tests for User Story 3

- [X] T049 [P] [US3] Criar `tests/integracao/configuracao.test.ts`:
  - `definir_estoque_total(30)` com 10 reservadas → disponível 20
  - Total abaixo do reservado → `estoque_abaixo_do_reservado`, nada muda; total negativo → `quantidade_invalida`; usuário comum → `nao_autorizado`
  - `definir_estoque_total` em paralelo com várias `criar_reserva` mantém `total = disponível + reservadas`
  - Mudar `preco_centavos` não altera `preco_unitario_centavos` nem `valor_total_centavos` das reservas existentes, e as novas usam o preço novo
  - `reservas_abertas = false` aparece em `obter_vitrine`
  - `update` direto de `estoque_disponivel` pelo admin falha por permissão

### Implementation for User Story 3

- [X] T050 [P] [US3] Criar `lib/dinheiro.ts` com `reaisParaCentavos(texto): number | null` (só manipulação de texto, sem `parseFloat`; aceita `"45,90"`, `"45,9"`, `"45"`, `"1.234,56"`, `"R$ 10,00"`; recusa negativos, letras e mais de 2 casas) e `centavosParaCampo(centavos)` (`4590` → `"45,90"`); testes em `tests/unit/dinheiro.test.ts`
- [X] T051 [US3] Acrescentar a `lib/schemas.ts`: `schemaPreco` (`{ preco: string }` → `reaisParaCentavos` → inteiro > 0, "Informe um preço maior que zero."), `schemaEstoqueTotal` (`{ total: inteiro >= 0 }`) e `schemaAbertura` (`{ abertas: boolean }`); testes em `tests/unit/schemas.test.ts`
- [X] T052 [US3] Criar `service/configuracao/configuracao.service.ts` com `import 'server-only'`: `definirPreco(supabase, centavos)` (`update` em `configuracao`), `definirEstoqueTotal(supabase, total)` (`rpc('definir_estoque_total')`; em `estoque_abaixo_do_reservado`, lê `pecas_reservadas` de `totais_venda` para a mensagem) e `definirReservasAbertas(supabase, abertas)`
- [X] T053 [US3] Criar `service/configuracao/configuracao.actions.ts` com as actions `definirPreco`, `definirEstoqueTotal` e `definirReservasAbertas` (`obterAdmin`, zod, devolvendo o código de erro e `n`; `revalidatePath('/admin')` e `revalidatePath('/')`)
- [X] T054 [US3] Criar a pasta `components/configuracoes-venda/` (container, view, viewmodel e model), recebendo `ResumoPainelDTO`: campo de preço (`inputMode="decimal"`, valor inicial `centavosParaCampo`, botão "Salvar preço"); campo "Total de queijos" (`inputMode="numeric"`, com "Reservadas: Y · Disponíveis: Z"); `Switch` "Aceitando reservas" / "Reservas encerradas"; toasts de sucesso e erro
- [X] T055 [US3] Em `app/admin/page.tsx`, incluir `<Configuracoes>` numa seção "Configurações da venda" (pode ser recolhível com `components/ui/collapsible.tsx`), passando o `ResumoPainelDTO`. Ajustes que vieram da implementação: faixa recolhível entre os cards de números e a lista (escolha do usuário em 2026-11-10), renderizada em `components/painel/painel.tsx`; fechada mostra o estado salvo numa frase e abre sozinha enquanto falta preço ou total; o texto ao lado da chave diz o que a página pública faz de fato; "Salvar" só fica ativo com mudança; o aviso do resumo também cobre total 0
- [X] T056 [US3] Validar US3: `npm run test:integracao` (`configuracao`) verde; roteiro "História 3" de `specs/001-cheese-reservations/quickstart.md` §7

**Checkpoint**: a vendedora abre a venda sozinha pelo painel.

---

## Phase 6: User Story 4 - Vendedora corrige ou cancela reservas (Priority: P4)

**Goal**: alterar a quantidade de reservas pendentes, corrigir nome, WhatsApp e endereço de
reservas ativas e cancelar reservas com confirmação.

**Independent Test**: aumentar e diminuir a quantidade de uma reserva pendente conferindo
estoque e total; corrigir o WhatsApp; cancelar uma reserva paga e vê-la como cancelada, fora dos
totais e sem ações.

### Tests for User Story 4

- [X] T057 [P] [US4] Criar `tests/integracao/correcoes.test.ts`:
  - `alterar_quantidade`: aumentar com estoque desconta só a diferença, e o total fica `nova × preço original` mesmo depois de mudar o preço do produto; aumentar sem estoque → `estoque_insuficiente`, nada muda; diminuir devolve peças; 0 → `quantidade_invalida`; 12 peças é aceito (acima do limite público); reserva paga → `reserva_paga`; cancelada → `reserva_cancelada`
  - `cancelar_reserva`: devolve estoque; repetir não muda nada; a reserva sai de `recebido`/`a_receber`
  - Usuário comum → `nao_autorizado` nas duas functions
  - Correção de dados: admin atualiza `nome`/`whatsapp`/`endereco` de reserva ativa sem mudar código, quantidade e valores; WhatsApp com 9 dígitos é recusado pelo `CHECK`; reserva cancelada → 0 linhas

### Implementation for User Story 4

- [X] T058 [US4] Acrescentar a `lib/schemas.ts`: `schemaIdReserva` (`{ id: uuid }`), `schemaAlterarQuantidade` (`{ id: uuid, quantidade: inteiro >= 1 }`, sem o limite de 10) e `schemaCorrigirDados` (`{ id: uuid }` + campos `nome`, `whatsapp`, `endereco` de T021); testes em `tests/unit/schemas.test.ts`
- [X] T059 [US4] Acrescentar a `service/reservas/reservas.service.ts`: `alterarQuantidade(supabase, id, quantidade)` (`rpc('alterar_quantidade', { p_reserva_id, p_nova_quantidade })`), `cancelarReserva(supabase, id)` (`rpc('cancelar_reserva', { p_reserva_id })`) e `corrigirDados(supabase, id, dados)` (`update({ nome, whatsapp, endereco }).eq('id', id).select('id')`, com retorno vazio → `reserva_cancelada`); erros via `registrarErro` e código
- [X] T060 [US4] Acrescentar a `service/reservas/reservas.actions.ts` as actions `alterarQuantidade`, `cancelarReserva` e `corrigirDados` (`obterAdmin`, zod, devolvendo o código de erro; `revalidatePath('/admin')`, e `revalidatePath('/')` em quantidade e cancelamento)
- [X] T061 [P] [US4] Criar a pasta `components/dialogo-quantidade/` (container, view, viewmodel e model, `components/ui/dialog.tsx`): campo numérico (mínimo 1, botões − e +), mostra o novo total como prévia (`nova × preço unitário`, só exibição) e chama `alterarQuantidade`; erro em toast ou no campo
- [X] T062 [P] [US4] Criar a pasta `components/dialogo-dados-cliente/` (container, view, viewmodel e model, `Dialog`): RHF + zod com os campos de nome, WhatsApp (máscara) e endereço preenchidos; erros por campo; chama `corrigirDados`
- [X] T063 [P] [US4] Criar a pasta `components/dialogo-cancelar/` (container, view, viewmodel e model, `components/ui/alert-dialog.tsx`) com o texto "Cancelar a reserva <código> de <nome> (<N> peças)? As peças voltam para o estoque. Isso não pode ser desfeito." e, se paga, também "Esta reserva já foi paga: lembre de devolver <valor> ao cliente."; botões "Voltar" e "Cancelar reserva"; chama `cancelarReserva`
- [X] T064 [US4] Em `components/linha-reserva/`, adicionar as ações: "Alterar quantidade" (só ativa com pagamento pendente; se paga, mostrar o texto de `reserva_paga`), "Corrigir dados" (só ativa) e "Cancelar" (só ativa), abrindo os diálogos de T061–T063. Ajustes que vieram da implementação: as ações ficam dentro dos detalhes da reserva (escolha do usuário em 2026-11-10); "Alterar quantidade" de reserva paga fica inativo mas alcançável pelo teclado, com o motivo logo abaixo; o aviso de devolução usa o nome da reserva; o toast do cancelamento diz que a reserva fica em Situação: Canceladas; os diálogos rolam por dentro em tela baixa
- [X] T065 [US4] Validar US4: `npm run test:integracao` (`correcoes`) verde; roteiro "História 4" de `specs/001-cheese-reservations/quickstart.md` §7

**Checkpoint**: todas as histórias funcionam de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: segurança do bundle, operação, limpeza e publicação

- [ ] T066 [P] Criar `scripts/verificar-bundle.mjs` (Node puro, sem dependências): lê `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` de `process.env` ou de `.env.local`, varre recursivamente `.next/static` e falha (`exit 1`) se encontrar um dos dois valores ou o texto `NEXT_PUBLIC_SUPABASE`; imprime só nomes de arquivos, nunca os valores
- [ ] T067 [P] Criar `.github/workflows/manter-ativo.yml`: `on: schedule` (`cron: '17 12 * * *'`) + `workflow_dispatch`; um passo com `curl -fsS -X POST "$SUPABASE_URL/rest/v1/rpc/obter_vitrine" -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Content-Type: application/json" -d '{}'`, com `env` vindo dos secrets `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`
- [ ] T068 Remover dependências e componentes sem uso (Princípio I; research R14): conferir com busca no código e então `npm uninstall recharts embla-carousel-react shiki cmdk input-otp react-resizable-panels react-day-picker date-fns`; apagar de `components/ui/` os componentes que não são importados por `app/` (incluindo os que dependiam dos pacotes removidos), além de `hooks/use-highlighted-code.ts` e `lib/highlighter.tsx` se não forem usados; mover `shadcn` para `devDependencies` e remover `@shadcn/react` se não houver import; `npx tsc --noEmit` sem erros
- [ ] T069 Rodar a verificação completa: `npm run lint`, `npx tsc --noEmit`, `npm run test:unit`, `npm run test:integracao`, `npm run build` e `npm run verificar-bundle`, tudo verde (`specs/001-cheese-reservations/quickstart.md` §3–§5)
- [ ] T070 Aplicar no remoto: `npx supabase db push` (só `supabase/migrations/<timestamp>_ajustes_spec.sql`; o seed não sobe); regenerar os tipos com `npx supabase gen types typescript --linked > lib/database.types.ts` e confirmar com `git diff` que não há diferença em relação aos tipos locais
- [ ] T071 Configuração manual de produção, feita pelo usuário: criar a usuária no Supabase Auth, inserir o `user_id` em `admins`, desativar a opção "Allow new users to sign up" sem desligar o provedor Email (desligá-lo impede o login), configurar `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` na Vercel e como secrets no GitHub e rodar o workflow `manter-ativo` uma vez (`specs/001-cheese-reservations/quickstart.md` §6)
- [ ] T072 Validação final no deploy: roteiro completo de `specs/001-cheese-reservations/quickstart.md` §7 no celular, em 360 px e pelo navegador interno do WhatsApp (Android e iOS se possível); confirmar que nenhuma página pública mostra telefone ou chave Pix (SC-006)
- [ ] T074 [P] Criar `app/not-found.tsx` e `app/error.tsx` em português (FR-038): as telas padrão do Next para página inexistente e erro inesperado estão em inglês. Texto simples, sem detalhes técnicos, com link para a página inicial
- [ ] T073 [P] Opcional: propor via `/speckit-constitution` uma emenda PATCH em `.specify/memory/constitution.md`, permitindo preço por `UPDATE` direto (o desvio em *Complexity Tracking* do plan.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup. Ordem interna obrigatória do banco:
  T005 → T006 → T007 → T008 → T010 → T011 → T012 (T009 em paralelo com T008). T013–T022 podem
  começar depois do Setup, em paralelo com o banco; T016 depende de T014; T021 depende de T020
- **User Stories (Phase 3+)**: dependem da fase Foundational completa
- **Polish (Phase 7)**: T066–T068 a qualquer momento após as histórias desejadas; T069 → T070 →
  T071 → T072 nessa ordem

### User Story Dependencies

- **US1 (P1)**: só depende da Foundational
- **US2 (P2)**: só depende da Foundational; testa com reservas criadas pelos helpers, sem
  depender da tela da US1
- **US3 (P3)**: depende da Foundational e da casca do painel (T047, página e login da US2), onde
  as configurações aparecem. Os testes de integração (T049) não dependem da US2
- **US4 (P4)**: depende da Foundational e de `linha-reserva.tsx` (T045, US2), onde as ações
  aparecem. Os testes de integração (T057) não dependem da US2

### Within Each User Story

- Testes de integração primeiro: devem falhar, ou passar só pela parte do banco, antes da UI
- `lib/` e models (puros, com teste) → service → actions → viewmodel → view e container → página → validação
- Tarefas que mexem no mesmo arquivo (`lib/schemas.ts`, `service/reservas/reservas.service.ts`,
  `service/reservas/reservas.actions.ts`, `app/admin/page.tsx`, `components/linha-reserva/`) são sequenciais entre
  histórias

### Parallel Opportunities

- Setup: T002, T003, T004
- Foundational: T009 junto com T008; T013, T014, T015, T017, T018, T019, T020, T022 entre si
- US1: T023, T024, T025, T026, T027 juntos; depois T030 e T031 juntos
- US2: T036, T037, T038 juntos; T043 e T044 juntos
- US3: T049 e T050 juntos
- US4: T057 sozinho no início; T061, T062 e T063 juntos
- Polish: T066, T067 e T073

---

## Parallel Example: User Story 1

```bash
# Testes e funções puras da US1 juntos:
Task: "Criar tests/integracao/reservar.test.ts"
Task: "Criar tests/integracao/permissoes-publicas.test.ts"
Task: "Criar components/comprovante/comprovante.model.ts + tests/unit/comprovante.test.ts"
Task: "Criar components/formulario-reserva/formulario-reserva.model.ts + tests/unit/vitrine.test.ts"
Task: "Criar service/vitrine/vitrine.service.ts"

# Depois de T028/T029, componentes independentes juntos:
Task: "Criar components/aviso-venda/aviso-venda.view.tsx"
Task: "Criar components/comprovante/"
```

## Parallel Example: User Story 4

```bash
Task: "Criar components/dialogo-quantidade/"
Task: "Criar components/dialogo-dados-cliente/"
Task: "Criar components/dialogo-cancelar/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (Setup) e Phase 2 (Foundational): banco versionado, ajustado e testável localmente
2. Phase 3 (US1)
3. **Parar e validar**: T035. Com preço e total definidos por SQL, a venda já pode abrir; as
   reservas são lidas no painel do Supabase até a US2 ficar pronta
4. Publicar, se quiser: T066–T072 valem também para o MVP

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → validar → publicar (MVP)
3. US2 → validar → publicar (vendedora acompanha pelo celular)
4. US3 → validar → publicar (vendedora ajusta preço, estoque e abertura sozinha)
5. US4 → validar → publicar (correções e cancelamentos)

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta
- [USn] liga a tarefa à história da spec, para rastreabilidade
- T006, T070 e T071 precisam do usuário (credenciais e painéis do Supabase, da Vercel e do
  GitHub)
- Fazer commit ao fim de cada tarefa ou grupo lógico; nunca commitar arquivos `.env*`
- Se algum item do T007 contradisser este plano (ex.: tipo de `id` ou forma de checar admin),
  ajustar as tarefas seguintes e registrar a mudança em `research.md`
