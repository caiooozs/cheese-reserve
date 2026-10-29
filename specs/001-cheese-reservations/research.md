# Research: Reserva de Queijos de Fim de Ano

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-29

Fontes consultadas: a spec, a constituição v1.0.0, a descrição do banco e da stack feita pelo
usuário no `/speckit-plan`, a documentação local do Next.js 16 (`node_modules/next/dist/docs/`:
`proxy.md`, `data-security.md`, `authentication-with-cache-components.md`, `07-mutating-data.md`)
e o estado atual do repositório (`next.config.ts` com `cacheComponents: true`, `components/ui/`,
`package.json`, `.env.local`).

---

## R1. O schema do banco ainda não está no repositório

**Constatação**: `supabase/migrations/` não existe. O schema foi criado direto no projeto remoto
(SQL rodado no editor do Supabase). A constituição exige schema, functions, RLS e grants
versionados no repositório.

**Decision**: a primeira tarefa da implementação é trazer o schema remoto para o repositório com
a Supabase CLI: `supabase init` → `supabase link` → `supabase db pull` (gera
`supabase/migrations/<timestamp>_remote_schema.sql` e registra a migration como aplicada no
histórico remoto). Em seguida, conferir a baseline contra a lista de verificação abaixo; qualquer
lacuna é corrigida na migration de ajustes (R2), nunca editando a baseline.

Lista de verificação da baseline (o que o plano assume e precisa ser confirmado no SQL puxado):

| # | Item | Esperado |
|---|------|----------|
| V1 | RLS | Habilitada em `configuracao`, `reservas` e `admins` |
| V2 | Grants do `anon` | Só `EXECUTE` em `obter_vitrine` e `criar_reserva`; nada em tabelas/views |
| V3 | `EXECUTE` padrão | Revogado de `PUBLIC` em todas as functions; `gerar_codigo_reserva` sem grant para `anon`/`authenticated` |
| V4 | `SECURITY DEFINER` | Toda function definer com `SET search_path` fixo |
| V5 | Admin | Políticas e functions administrativas checam `admins` (não só `authenticated`) |
| V6 | Estoque atômico | `criar_reserva`, `alterar_quantidade` e `cancelar_reserva` travam/condicionam a linha de `configuracao`; `CHECK (estoque_disponivel >= 0)` |
| V7 | Limite | `criar_reserva` recusa quantidade fora de 1–10 com `quantidade_invalida` |
| V8 | Dados do cliente | `CHECK`s de tamanho/formato em `nome`, `whatsapp`, `endereco` compatíveis com R9 |
| V9 | Cancelada só leitura | Política de `UPDATE` em `reservas` exige `cancelada_em IS NULL` |
| V10 | Tipos | Tipo de `reservas.id` (provável `uuid`) e de status (enum ou `text` + `CHECK`) |

**Rationale**: `db pull` reflete o que está de fato no remoto (inclusive ajustes feitos à mão
depois do SQL original), coisa que copiar o SQL do chat não garante.

**Alternatives considered**: copiar o SQL guardado no chat para `supabase/migrations/` —
descartado como fonte da verdade, porque o remoto pode ter divergido; serve só como referência
para comparar. Observação: `db pull` e o banco local de testes (`supabase start`) precisam do
Docker Desktop rodando.

---

## R2. Diferenças entre a spec e o banco já criado

**Constatação**: o banco descrito cobre a maior parte da spec, mas não cobre cinco decisões
tomadas no `/speckit-specify` e no `/speckit-clarify`, e deixa uma brecha contra a constituição.

| Spec | Banco hoje | Ajuste |
|------|-----------|--------|
| FR-034/035: ela edita o **total** de queijos; o total não pode ficar abaixo do reservado | Admin faz `UPDATE` direto em `estoque_disponivel` | Nova function `definir_estoque_total` (R3) e `REVOKE UPDATE (estoque_disponivel)` |
| FR-041: botão abrir/encerrar | Só "preço 0 = fechado" (`venda_fechada`) | Coluna `configuracao.reservas_abertas`; erro `reservas_encerradas` |
| FR-040: corrigir nome, WhatsApp e endereço | Admin só edita preço, estoque e status | `GRANT UPDATE (nome, whatsapp, endereco)` para o admin via RLS (reserva ativa) |
| FR-008: preço mudou enquanto o cliente preenchia | `criar_reserva` não sabe o preço que o cliente viu | Parâmetro `p_preco_esperado_centavos`; erro `preco_alterado` (R5) |
| FR-009: envio repetido não duplica | Sem proteção | Parâmetro `p_chave_envio` + coluna única (R4) |
| FR-026: painel mostra total, reservadas e disponíveis | View só tem valores | `totais_venda` ganha `pecas_reservadas` |

**Decision**: uma única migration nova, `supabase/migrations/<timestamp>_ajustes_spec.sql`, com
todos os ajustes acima (detalhes em [data-model.md](./data-model.md) e
[contracts/banco-rpc.md](./contracts/banco-rpc.md)). `criar_reserva` e `obter_vitrine` são
recriadas (assinatura/retorno mudam), com os grants refeitos (`anon` só nessas duas).

**Rationale**: a spec é a fonte do *quê*; o usuário autorizou mudanças no banco "como nova
migration". A constituição III proíbe resolver essas regras no app ("ler, conferir, gravar").

**Alternatives considered**: mudar a spec para caber no banco — descartado, porque as cinco
decisões foram tomadas explicitamente pelo usuário; fazer as checagens de preço e de estoque na
Server Action antes da RPC — descartado (janela de corrida; viola o Princípio III).

---

## R3. Estoque como "total de queijos" sem reescrever as functions existentes

**Decision**: manter a coluna `estoque_disponivel` (que `criar_reserva`, `alterar_quantidade` e
`cancelar_reserva` já mantêm) e tratar o total como derivado:
`total = estoque_disponivel + soma(quantidade das reservas ativas)`. A nova function
`definir_estoque_total(p_total)`:

1. confere admin (`nao_autorizado`) e `p_total >= 0` (`quantidade_invalida`);
2. trava a linha única de `configuracao` com `SELECT ... FOR UPDATE`;
3. soma as reservas ativas (snapshot novo, depois da trava);
4. se `p_total < reservadas`, falha com `estoque_abaixo_do_reservado`;
5. grava `estoque_disponivel = p_total - reservadas`.

Como toda function que mexe no estoque atualiza a mesma linha de `configuracao`, a trava
serializa tudo: uma reserva concorrente ou entra na soma ou espera e desconta do novo disponível.
O invariante `total = disponível + reservadas` vale nos dois casos.

**Rationale**: atende FR-034/035 e o Princípio III sem tocar nas três functions que já existem e
funcionam.

**Alternatives considered**: nova coluna `estoque_total` e disponível calculado em todas as
functions — descartado (reescreve três functions); deixar a admin editar o disponível — descartado
(se uma reserva entrar enquanto ela edita, ela "devolve" peças que não existem: venda acima do
estoque).

---

## R4. Envio repetido (toque duplo, conexão instável)

**Decision**: o formulário gera uma `chaveEnvio` (`crypto.randomUUID()`) ao montar e a renova
após cada reserva concluída. A Server Action repassa como `p_chave_envio`; `reservas.chave_envio`
tem índice único. Se a chave já existe, `criar_reserva` devolve a reserva existente (mesmo
retorno) em vez de criar outra. Além disso, o botão fica desabilitado enquanto a action está
pendente.

**Rationale**: só desabilitar o botão não cobre a resposta perdida (a reserva foi criada, mas a
conexão caiu e o cliente tenta de novo). `crypto.randomUUID` exige contexto seguro, o que vale na
Vercel (HTTPS) e em `localhost`.

**Alternatives considered**: deduplicar por WhatsApp + janela de tempo — descartado (bloquearia o
caso legítimo "quero mais peças" da spec).

---

## R5. Preço que muda enquanto o cliente preenche

**Decision**: o formulário envia o preço que exibiu (`precoEsperadoCentavos`). `criar_reserva` lê
o preço atual sob a mesma trava de `configuracao` e, se diferente, falha com `preco_alterado`. A
Server Action então chama `obter_vitrine` e devolve o preço e o disponível atuais, para a tela
mostrar o novo total e pedir nova confirmação. O mesmo retorno de vitrine acompanha
`estoque_insuficiente`, `reservas_encerradas` e `venda_fechada`.

**Rationale**: FR-008 e Princípio IV ("o cliente paga o que viu").

---

## R6. Next.js 16 com `cacheComponents` ativo

**Constatação**: `next.config.ts` tem `cacheComponents: true` e `partialPrefetching: true`. Com
isso, ler `cookies()` ou buscar dados sem cache fora de um `<Suspense>` é erro de build.

**Decision**:

- `/`: casca estática (nome e descrição do queijo, instruções) + `<Suspense>` em volta do bloco
  que chama `obter_vitrine` a cada requisição (sem `use cache`) e renderiza o estado da venda ou
  o formulário.
- `/admin`: casca + `<Suspense>` em volta do conteúdo, que começa chamando `exigirAdmin()` (lê a
  sessão; redireciona se não for admin) e depois busca totais e reservas. Filtros e busca chegam
  por `searchParams`, lidos dentro do mesmo limite.
- `/admin/login`: formulário estático; a action faz o login.
- Mutações: Server Actions com `revalidatePath('/')` e/ou `revalidatePath('/admin')`.
- Plano B, se algum trecho brigar com a validação de navegação instantânea:
  `export const instant = false` na página (previsto na doc de migração).

**Rationale**: é o padrão da doc do Next 16 (`authentication-with-cache-components.md`). O
volume é pequeno, então buscar a vitrine a cada requisição é mais simples e sempre correto.

**Alternatives considered**: `use cache` + `cacheTag('vitrine')` invalidado nas actions —
descartado (mais peças para pouco ganho; o estoque muda com reservas de outras pessoas);
desligar `cacheComponents` — descartado sem necessidade, já está configurado.

---

## R7. Clientes do Supabase, sessão e checagem de admin (só no servidor)

**Decision**: `server/supabase.ts` (com `import 'server-only'`) exporta duas fábricas:

- `clientePublico()`: `createClient` do `supabase-js` com a chave publishable e
  `auth: { persistSession: false, autoRefreshToken: false }`, sem cookies. Usado em
  `obter_vitrine` e `criar_reserva`. Não ler cookies mantém a página pública independente da
  sessão.
- `clienteDaSessao()`: `createServerClient` do `@supabase/ssr` com `cookies()` (`getAll`/`setAll`;
  `setAll` em `try/catch`, porque Server Components não gravam cookies). Usado no painel e no
  login.

`server/auth.ts` exporta `exigirAdmin()`: `supabase.auth.getClaims()` (valida o JWT) → sem
usuário, `redirect('/admin/login')`; com usuário, confere se é admin. Para a conferência, usa o
helper que as políticas da baseline já usam (se existir e for executável por `authenticated`) ou
uma function nova `eh_admin()` (`SECURITY DEFINER`, retorna `boolean`) na migration de ajustes.
Toda Server Action do painel chama `exigirAdmin()` antes de qualquer coisa.

`proxy.ts` (raiz, `matcher: ['/admin/:path*']`): renova a sessão (padrão `updateSession` do
`@supabase/ssr`) e redireciona para `/admin/login` quem não tem sessão. Não decide quem é admin:
isso fica na página, nas actions e, por último, no banco.

**Rationale**: atende a "fronteira servidor/cliente" pedida e o Princípio VI (o banco é a última
barreira). `getClaims` é a forma recomendada para validar a sessão no servidor com as chaves novas
(publishable/assimétricas).

**Alternatives considered**: `getSession()` no servidor — descartado (não valida o token);
checar admin só no `proxy.ts` — descartado (a doc do Next pede checagem perto do dado).

---

## R8. Variáveis de ambiente

**Constatação**: `.env.local` usa `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; com esse prefixo, os valores vão para o JavaScript do
navegador.

**Decision**: renomear para `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` (local, Vercel e secrets
do GitHub). Só `server/supabase.ts` lê `process.env`. `.env*` já está no `.gitignore`. Depois do
build, `scripts/verificar-bundle.mjs` procura os dois valores em `.next/static` e falha se
encontrar.

---

## R9. Formulário de reserva e validação

**Decision**:

- `lib/schemas.ts` (sem `server-only`, usado nos dois lados): `nome` 2–80 após `trim`;
  `whatsapp` normalizado para dígitos (tira `+`, espaços, parênteses e hífens; remove o `55` do
  começo quando sobram 12–13 dígitos) com 10 ou 11 dígitos; `quantidade` inteira 1–10;
  `endereco` opcional, até 200, vazio vira `null`; `precoEsperadoCentavos` inteiro > 0;
  `chaveEnvio` UUID. No navegador, uma fábrica `schemaReserva(disponivel)` acrescenta
  `quantidade <= min(10, disponivel)`.
- `LIMITE_POR_RESERVA = 10` em `lib/constantes.ts`; um teste de integração garante que
  `criar_reserva` aceita 10 e recusa 11 (mantém os dois em sincronia).
- Componentes: `Field` do shadcn + React Hook Form (`Controller`) + `zodResolver`. Envio por
  `startTransition(() => reservar(dados))`, com `useTransition` para o estado pendente.
- Máscara do WhatsApp com uma função pura de formatação em `lib/whatsapp.ts` (sem biblioteca de
  máscara); `inputMode="tel"`, `autoComplete="tel"`.
- Campo-armadilha (honeypot): input de texto fora da tela, `tabIndex={-1}`, `aria-hidden`,
  `autoComplete="off"`. Se vier preenchido, a action responde sucesso genérico sem chamar a RPC
  e sem comprovante.

**Rationale**: atende FR-004/005 e a stack pedida, sem dependências novas (RHF, zod e resolvers
já estão no `package.json`).

---

## R10. Toasts: o projeto já tem um

**Decision**: usar o `components/ui/toast.tsx` que já existe (Toast do Base UI, instalado com o
shadcn `base-nova`), e não adicionar o Sonner.

**Rationale**: o Princípio I pede justificar cada dependência nova e indicar a alternativa mais
simples descartada; aqui a alternativa mais simples já está no projeto e entrega o mesmo
resultado. **Desvio do texto do usuário**, que pediu Sonner: se ele preferir manter o Sonner, a
troca fica restrita ao provider e às chamadas de toast.

---

## R11. Comprovante, compartilhar e copiar

**Decision**:

- O comprovante é um estado do próprio formulário em `/` (não há rota pública por código, FR-016).
- O texto vem de `lib/comprovante.ts` (função pura), no formato definido em
  [contracts/server-actions.md](./contracts/server-actions.md#texto-do-comprovante): "1 peça" /
  "N peças", linha "Entrega" só com endereço e data "29/10/2026 às 15:02" (montada com
  `Intl.DateTimeFormat(...).formatToParts`, fuso `America/Sao_Paulo`).
- Botões: "Compartilhar" aparece só se `navigator.share` existir (`navigator.share({ text })`;
  cancelar o compartilhamento não é erro). "Copiar" aparece sempre (`navigator.clipboard`); se a
  cópia falhar, um toast pede para tirar print.
- Card pensado para 360×640: código em destaque com `font-mono` (Geist Mono, já carregada no
  layout).

**Rationale**: a spec pede os dois botões (FR-012); o texto do usuário dizia que o botão "vira
Copiar". Ficou assim: "Copiar" sempre e "Compartilhar" quando houver suporte, o que cobre as duas
leituras.

---

## R12. Dinheiro, datas e mensagens

**Decision**:

- `lib/formatacao.ts`: `formatarReais(centavos)` com `Intl.NumberFormat('pt-BR', { style:
  'currency', currency: 'BRL' })`; `formatarDataHora(iso)` com fuso `America/Sao_Paulo`. A saída
  do `Intl` usa espaço não separável (`R$ 100,00`); os testes comparam com isso.
- `lib/dinheiro.ts`: `reaisParaCentavos("45,90") → 4590` por manipulação de texto (sem
  `parseFloat * 100`, Princípio IV), usado no campo de preço do painel.
- `lib/erros.ts`: tabela código → mensagem em português ([contracts](./contracts/server-actions.md#mensagens-de-erro))
  e mensagem genérica para o resto. No servidor, o log registra só `code` e `message` do erro do
  Supabase, nunca `details`/`hint`: violações de `CHECK` podem repetir a linha inteira (nome,
  WhatsApp e endereço) e vazar dados de cliente para os logs da Vercel (Princípio V).

---

## R13. Testes

**Decision**:

- **Vitest** (nova dependência de desenvolvimento), dois scripts: `test:unit` (`tests/unit`) e
  `test:integracao` (`tests/integracao`).
- Unitários: schemas zod, normalização e link do WhatsApp, normalização do código da busca,
  texto do comprovante (com/sem endereço, 1 peça/N peças), `formatarReais`, `formatarDataHora`,
  `reaisParaCentavos` e tradução de erros (inclusive o genérico).
- Integração: `supabase start` + `supabase db reset` (aplica baseline, ajustes e
  `supabase/seed.sql`). Os testes usam o `supabase-js` direto contra a API local, com a chave
  publishable local, como `anon`, como admin de teste e como usuário comum. O seed cria esses dois
  usuários em `auth.users` (senha com `crypt`) e o registro em `admins`, então **não é preciso
  `service_role`**. Cobertura: formato do código; reservas concorrentes na última peça (exatamente
  1 sucesso); limite 10/11; `preco_alterado`; `reservas_encerradas`; chave de envio repetida;
  alterar quantidade (aumentar com e sem estoque, diminuir, reserva paga); cancelar (devolve
  estoque, idempotente); `definir_estoque_total` (abaixo do reservado); RLS (`anon` e usuário
  comum sem acesso a reservas; admin não altera reserva cancelada).
- Os módulos com `server-only` não são importados pelos testes: a lógica testável fica em `lib/`
  (funções puras) e as integrações testam o banco diretamente.
- Verificação de build: `scripts/verificar-bundle.mjs` (R8).
- **Playwright fica fora do plano inicial** (o usuário marcou como opcional e o Princípio I pede
  justificar cada dependência); o fluxo ponta a ponta é validado à mão pelo
  [quickstart](./quickstart.md).

---

## R14. Operação

**Decision**:

- `.github/workflows/manter-ativo.yml`: `schedule` diário + `workflow_dispatch`; um `curl` em
  `POST $SUPABASE_URL/rest/v1/rpc/obter_vitrine` com o header `apikey`, usando os secrets
  `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. Falha o job se a resposta não for 200.
- Configuração manual (uma vez): criar a usuária no Supabase Auth, inserir o `user_id` em
  `admins`, desativar sign-ups, configurar as variáveis na Vercel.
- Antes de publicar, remover dependências e componentes sem uso (Princípio I): candidatos
  `recharts`, `embla-carousel-react`, `shiki`, `cmdk`, `input-otp`, `react-resizable-panels`,
  `react-day-picker`, `date-fns` (o plano proíbe libs de data) e os componentes de
  `components/ui/` e `hooks/`/`lib/` que dependem deles. Confirmar o uso com busca no código antes
  de remover.
- `app/layout.tsx`: `lang="pt-BR"` e metadados (título, descrição e Open Graph com uma imagem
  estática em `public/`, se houver foto do queijo).
