# Implementation Plan: Reserva de Queijos de Fim de Ano

**Branch**: `001-cheese-reservations` (diretório da feature; o trabalho segue em `master`) |
**Date**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-cheese-reservations/spec.md`

## Summary

App de uma página pública de reserva e um painel para a vendedora, para a venda de queijos de fim
de ano. As regras de estoque e de valores ficam em functions do Postgres (Supabase), que já
existem no projeto remoto. O app em Next.js 16 só exibe dados, valida para dar feedback e chama o
banco a partir do servidor: o navegador nunca fala com o Supabase.

O trabalho tem três frentes:

1. **Trazer o banco remoto para o repositório** (`supabase db pull`) e conferir a baseline.
2. **Uma migration de ajustes** para o que a spec decidiu e o banco ainda não cobre: total de
   queijos em vez de disponível editável, botão abrir/encerrar, correção de dados do cliente,
   checagem de preço alterado, envio idempotente e peças reservadas na view de totais
   ([research R2](./research.md#r2-diferenças-entre-a-spec-e-o-banco-já-criado)).
3. **O app**: `/`, `/admin/login` e `/admin`, Server Actions, testes unitários e de integração
   contra o Supabase local, verificação do bundle e o workflow diário que mantém o projeto ativo.

## Technical Context

**Language/Version**: TypeScript 5, React 19.3, Next.js 16.4.3 (App Router, `cacheComponents`
ativo)

**Primary Dependencies**: `@supabase/ssr` 0.12 e `@supabase/supabase-js` 2.118 (só no servidor);
shadcn/ui `base-nova` (Base UI) + Tailwind CSS 4; React Hook Form 7 + zod 4 +
`@hookform/resolvers` 6 (já instalados); `server-only` (nova); toasts com o
`components/ui/toast.tsx` existente

**Storage**: Supabase Postgres (projeto remoto, plano gratuito) + Supabase Auth; schema
versionado em `supabase/migrations/`

**Testing**: Vitest (unitário e integração contra o Supabase local via `supabase start`);
script de verificação do bundle; Playwright adiado (ver research R13)

**Target Platform**: Vercel (runtime Node.js); navegadores de celular, inclusive o navegador
interno do WhatsApp (Android e iOS)

**Project Type**: aplicação web (um único projeto Next.js)

**Performance Goals**: página pública utilizável em até 3 s numa conexão móvel comum (SC-010);
painel com algumas centenas de reservas sem paginação

**Constraints**: nenhum client do Supabase no navegador; nenhuma variável `NEXT_PUBLIC_`;
dinheiro em centavos inteiros; datas em `America/Sao_Paulo`; telas usáveis em 360 px; sem libs
de data, moeda, gráfico ou imagem

**Scale/Scope**: 1 produto, 1 administradora, dezenas a poucas centenas de reservas numa
temporada; 3 rotas, 1 action pública, 8 actions do painel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Avaliado contra a constituição v2.0.0.

| Princípio | Antes da pesquisa | Depois do design | Como o plano atende |
|-----------|-------------------|------------------|---------------------|
| I. Simplicidade | ⚠️ | ✅ com justificativas | Um projeto Next + Supabase, sem API separada. Dependências novas: só `server-only`, Vitest e Supabase CLI (justificadas abaixo). Sonner trocado pelo toast que já existe; Playwright adiado; sem libs de data/moeda. Arquitetura MVVM com services e containers definida na própria constituição (v2.0.0). Limpeza de dependências sem uso antes de publicar (R14). |
| II. Mobile-first | ✅ | ✅ | 360 px como referência; `inputMode="tel"`/numérico; comprovante cabe em 360×640; Open Graph; validação manual no navegador do WhatsApp (quickstart §7). |
| III. Integridade do Estoque | ❌ admin editava `estoque_disponivel` direto | ✅ | Reservar/alterar/cancelar em functions [base]; `definir_estoque_total` com trava [novo]; `UPDATE` direto no estoque revogado; preço e abertura conferidos dentro de `criar_reserva`; teste de concorrência. Desvio justificado: preço por `UPDATE` direto (ver *Complexity Tracking*). |
| IV. Integridade dos Valores | ✅ | ✅ | Centavos inteiros; `preco_unitario_centavos` copiado na criação; total gerado no banco; `reaisParaCentavos` sem ponto flutuante; `preco_alterado` (R5). |
| V. Privacidade | ✅ | ✅ | Só nome, WhatsApp e endereço; honeypot não coleta nada; nenhum dado da vendedora no app; logs sem `details`/`hint` (R12); DTOs mínimos. |
| VI. Segurança do Painel | ⚠️ baseline não verificada | ✅ após V1–V10 | `anon` só em 2 RPCs; admin conferido no banco, na página e em cada action; sign-ups desativados; sem `service_role`; `getClaims`; functions novas com `search_path` e `REVOKE ... FROM PUBLIC`. |
| VII. pt-BR e linguagem simples | ✅ | ✅ | `lang="pt-BR"`; tabela de mensagens; `Intl` com fuso e BRL; confirmação ao cancelar. |
| Restrições Técnicas: migrations no repositório | ❌ schema só no remoto | ✅ após a tarefa 1 | `supabase db pull` como primeira tarefa; ajustes em migration nova. |
| Restrições Técnicas: segredos | ❌ `.env.local` usa `NEXT_PUBLIC_SUPABASE_*` | ✅ | Renomear para `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`; verificação do bundle. |
| Fluxo: verificação reproduzível | ✅ | ✅ | Integração cobre concorrência, valores e RLS; checagem em 360 px; checagem de telefone/Pix na página publicada (quickstart §7). |

**Resultado**: o gate passa. Os ❌ da coluna "antes" são pendências do estado atual, não do
desenho: viram as primeiras tarefas (baseline, variáveis e migration de ajustes). Os desvios que
sobram estão justificados abaixo.

## Project Structure

### Documentation (this feature)

```text
specs/001-cheese-reservations/
├── plan.md              # Este arquivo
├── research.md          # Fase 0: decisões R1–R14
├── data-model.md        # Fase 1: tabelas, estados, invariantes e permissões
├── quickstart.md        # Fase 1: setup e validação ponta a ponta
├── contracts/
│   ├── banco-rpc.md     # Functions, acesso direto e códigos de erro
│   └── server-actions.md # Rotas, actions, DTOs, comprovante e mensagens
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 (/speckit-tasks; não criado aqui)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                 # lang="pt-BR", metadados/OG, provider de toast
├── page.tsx                   # "/": casca do cartão + <Suspense> da vitrine
└── admin/
    ├── login/page.tsx
    └── page.tsx               # casca + <Suspense> → exigirAdmin() → painel

components/
├── ui/                        # shadcn existente (field, input, button, alert-dialog, toast...)
├── vitrine/vitrine.tsx        # Server Component: lê pelo service e entrega DTO ao container
├── formulario-reserva/
│   ├── formulario-reserva.container.tsx
│   ├── formulario-reserva.view.tsx
│   ├── formulario-reserva.viewmodel.ts # estado, envio e chamada de reservar()
│   └── formulario-reserva.model.ts     # schema do formulário, tipos, estado da vitrine
├── comprovante/               # mesmos quatro arquivos: texto, Copiar e Compartilhar
├── aviso-venda/, valor-animado/  # só View: peças visuais sem estado
└── (painel)                   # formulario-login/, busca-filtros/, linha-reserva/, ...

service/                       # único lugar que fala com o Supabase e lê process.env
├── supabase/clientes.ts       # clientePublico(), clienteDaSessao()
├── supabase/registrar-erro.ts # log sem dados de cliente
├── auth/auth.service.ts       # obterAdmin(), exigirAdmin()
├── auth/auth.actions.ts       # entrar(), sair()
├── vitrine/vitrine.service.ts # obterVitrine() → VitrineDTO
├── reservas/reservas.service.ts # criarReserva(), listarReservas(), resumoPainel() e escritas
├── reservas/reservas.actions.ts # reservar() e actions de reserva do painel
├── configuracao/configuracao.service.ts # preço, estoque total e abertura
└── configuracao/configuracao.actions.ts # actions de configuração do painel

lib/                           # funções puras, usadas no cliente, no servidor e nos testes
├── constantes.ts              # LIMITE_POR_RESERVA = 10
├── schemas.ts                 # campos e schemas usados pelo service e por vários componentes
├── tipos.ts                   # DTOs entre service e componentes
├── produto.ts                 # textos do produto e da saudação
├── whatsapp.ts                # normalizar, formatar (máscara), linkWhatsApp
├── codigo.ts                  # normalizarCodigoBusca
├── formatacao.ts              # formatarReais, formatarDataHora
├── dinheiro.ts                # reaisParaCentavos
├── erros.ts                   # traduzirErro
├── database.types.ts          # gerado: supabase gen types
└── utils.ts                   # (existente)

proxy.ts                       # renova sessão; protege /admin/*

supabase/
├── config.toml
├── migrations/
│   ├── 20261029180*.sql       # baseline rodada no SQL Editor
│   └── <ts>_ajustes_spec.sql  # ajustes R2
└── seed.sql                   # só local: config, admin de teste, usuário comum

tests/
├── unit/                      # lib/*
└── integracao/                # RPCs e RLS contra o Supabase local

scripts/verificar-bundle.mjs   # procura SUPABASE_* em .next/static
.github/workflows/manter-ativo.yml
vitest.config.mts
```

**Structure Decision**: um único projeto Next.js na raiz, sem `src/`. Componentes ficam em
`components/<nome>/`, cada um com seus arquivos do MVVM, e toda chamada ao Supabase fica em
`service/<domínio>/`. `lib/` guarda só o que é compartilhado entre service e componentes.

**Arquitetura (MVVM com services)**, decisão do usuário em 2026-10-30, detalhada em
[research R15](./research.md#r15-mvvm-com-services-e-containers):

```text
Leitura: Server Component → service → Supabase
         Server Component → DTO → container
Escrita: view → viewmodel → Server Action → service → Supabase
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Preço por `UPDATE` direto (Princípio III pede function para ajustes de preço) | O banco já foi feito assim. Mudar o preço é um `UPDATE` atômico de uma linha, protegido por RLS e `CHECK`, que não mexe em reservas existentes (preço copiado). `criar_reserva` lê o preço sob a mesma trava e confere o preço esperado. | Criar `definir_preco()`: mais uma function sem ganho de integridade. Sugestão: emenda PATCH no Princípio III ("ajustes que dependem do estado das reservas, como o estoque, via function"). |
| Dependências novas: `server-only`, `vitest` (dev), `supabase` CLI (dev) | `server-only`: barreira de build da fronteira servidor/cliente. Vitest: exigido pela constituição (verificação reproduzível de estoque, valores e permissões). Supabase CLI: `db pull`, migrations, banco local e tipos. | Sem testes automatizados: a constituição exige verificação reproduzível de concorrência e RLS. Sem CLI: as migrations não teriam como chegar ao repositório. |
| Coluna `chave_envio` + parâmetro em `criar_reserva` | FR-009: um envio repetido por resposta perdida não pode virar duas reservas. | Só desabilitar o botão: não cobre a resposta perdida (R4). |
