# Data Model: Reserva de Queijos de Fim de Ano

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md) | **Date**: 2026-10-29

Legenda da origem de cada item:

- **[base]**: já existe no banco remoto, segundo a descrição do usuário; confirmar após o
  `supabase db pull` (lista V1–V10 em [research.md](./research.md#r1-o-schema-do-banco-ainda-não-está-no-repositório)).
- **[novo]**: entra na migration `<timestamp>_ajustes_spec.sql`.

Dinheiro sempre em centavos (`integer`); instantes em `timestamptz` (UTC no banco, exibidos em
`America/Sao_Paulo`).

## Entidades

### `configuracao` (linha única) — "Venda" na spec

| Campo | Tipo | Regras | Origem |
|-------|------|--------|--------|
| `preco_centavos` | `integer` | `>= 0`; `0` = reservas ainda não abriram | [base] |
| `estoque_disponivel` | `integer` | `>= 0` (`CHECK`); só functions alteram | [base] |
| `reservas_abertas` | `boolean` | `NOT NULL DEFAULT true` | [novo] |

- Garantia de linha única (ex.: chave constante + `CHECK`): [base], confirmar.
- **Total de queijos** (FR-034) não é coluna: `estoque_disponivel + pecas_reservadas`.
- Escrita: `preco_centavos` e `reservas_abertas` por `UPDATE` direto do admin (RLS + grant de
  coluna); `estoque_disponivel` só pelas functions (o `UPDATE` direto é revogado [novo]).

### `reservas` — "Reserva" na spec

| Campo | Tipo | Regras | Origem |
|-------|------|--------|--------|
| `id` | `uuid` (confirmar) | PK; usado só no painel | [base] |
| `codigo` | `text` | 6 caracteres de `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, ao menos 1 letra e 1 número; `UNIQUE`; gerado por `gerar_codigo_reserva()` | [base] |
| `nome` | `text` | 2–80 caracteres após `trim` (`CHECK`) | [base]; `CHECK` a confirmar (V8) |
| `whatsapp` | `text` | só dígitos, 10 ou 11 (`CHECK`), sem o `55` | [base]; `CHECK` a confirmar (V8) |
| `endereco` | `text NULL` | até 200 caracteres; vazio vira `NULL` | [base]; `CHECK` a confirmar (V8) |
| `quantidade` | `integer` | `>= 1` (o limite de 10 vale só em `criar_reserva`) | [base] |
| `preco_unitario_centavos` | `integer` | `> 0`; copiado de `configuracao` na criação; nunca muda | [base] |
| `valor_total_centavos` | `integer` gerado | `quantidade * preco_unitario_centavos` (`GENERATED ALWAYS ... STORED`) | [base] |
| `status_pagamento` | enum/`text` | `pendente` \| `pago`; padrão `pendente` | [base] |
| `status_entrega` | enum/`text` | `pendente` \| `entregue`; padrão `pendente` | [base] |
| `cancelada_em` | `timestamptz NULL` | `NULL` = ativa; preenchida = cancelada (definitivo) | [base] |
| `created_at` | `timestamptz` | `DEFAULT now()`; exibida como "data e hora da reserva" | [base] |
| `chave_envio` | `uuid NULL` | `UNIQUE` (índice parcial `WHERE chave_envio IS NOT NULL`) | [novo] |

### `admins`

| Campo | Tipo | Regras | Origem |
|-------|------|--------|--------|
| `user_id` | `uuid` | PK, referencia `auth.users(id)`; uma linha (a vendedora) | [base] |

Sem escrita pela API; a linha é inserida à mão no setup (ver [quickstart.md](./quickstart.md)).

### View `totais_venda`

| Campo | Regra | Origem |
|-------|-------|--------|
| `recebido_centavos` | soma de `valor_total_centavos` das ativas com `status_pagamento = 'pago'` | [base] |
| `a_receber_centavos` | soma das ativas com `status_pagamento = 'pendente'` | [base] |
| `pecas_reservadas` | soma de `quantidade` das ativas | [novo] (adicionada ao fim com `CREATE OR REPLACE VIEW`) |

Leitura só para o admin (view com `security_invoker = true` ou grants equivalentes: confirmar
na baseline).

## Relações

- `configuracao` 1 — N `reservas`, de forma lógica (sem FK): as reservas ativas consomem
  `estoque_disponivel`.
- `admins.user_id` → `auth.users.id`.

## Estados e transições

### Reserva

```text
                criar_reserva
                     │
                     ▼
        ┌─────── ATIVA ────────┐   pagamento: pendente ⇄ pago      (UPDATE, admin)
        │  (cancelada_em NULL) │   entrega:   pendente ⇄ entregue  (UPDATE, admin)
        │                      │   dados do cliente: corrigir      (UPDATE, admin) [novo]
        │                      │   quantidade: só com pagamento pendente (alterar_quantidade)
        └──────────┬───────────┘
                   │ cancelar_reserva (paga ou não)
                   ▼
              CANCELADA  (cancelada_em preenchida; só leitura; repetir o cancelamento não muda nada)
```

| Ação | Permitida quando | Efeito no estoque | Erros |
|------|------------------|-------------------|-------|
| Criar | preço > 0, reservas abertas, preço = esperado, 1–10, estoque suficiente | `− quantidade` | `venda_fechada`, `reservas_encerradas`, `preco_alterado`, `quantidade_invalida`, `estoque_insuficiente`, `codigo_indisponivel` |
| Alternar pagamento/entrega | ativa | nenhum | política RLS recusa se cancelada |
| Corrigir dados | ativa | nenhum | política RLS recusa se cancelada; `CHECK`s |
| Alterar quantidade | ativa e pagamento pendente; nova ≥ 1 | `− (nova − atual)` | `reserva_nao_encontrada`, `reserva_cancelada`, `reserva_paga`, `quantidade_invalida`, `estoque_insuficiente`, `nao_autorizado` |
| Cancelar | ativa (repetir em cancelada não faz nada) | `+ quantidade` | `reserva_nao_encontrada`, `nao_autorizado` |

### Estado da página pública (derivado de `obter_vitrine`)

Ordem de prioridade (FR-041):

1. `preco_centavos = 0` → "As reservas ainda não abriram".
2. `reservas_abertas = false` → "As reservas estão encerradas".
3. `estoque_disponivel = 0` → "Esgotou".
4. Caso contrário → formulário (quantidade máxima = `min(10, estoque_disponivel)`).

## Invariantes (verificados nos testes de integração)

1. `estoque_disponivel >= 0` sempre (`CHECK`).
2. `total = estoque_disponivel + pecas_reservadas` não muda por reservar, alterar ou cancelar;
   só muda por `definir_estoque_total`.
3. Nenhuma combinação de chamadas concorrentes faz `pecas_reservadas` passar do total.
4. `preco_unitario_centavos` de uma reserva nunca muda; `valor_total_centavos` só muda com a
   quantidade.
5. `recebido + a_receber` = soma de `valor_total_centavos` das reservas ativas.
6. Duas chamadas de `criar_reserva` com a mesma `chave_envio` resultam em uma só reserva.

## Permissões (resultado esperado após a migration de ajustes)

| Objeto | `anon` | `authenticated` não admin | admin |
|--------|--------|---------------------------|-------|
| `obter_vitrine()` | EXECUTE | como na baseline (o app sempre chama como `anon`) | idem |
| `criar_reserva(...)` | EXECUTE | como na baseline (o app sempre chama como `anon`) | idem |
| `alterar_quantidade`, `cancelar_reserva`, `definir_estoque_total` [novo] | — | EXECUTE, mas a function recusa (`nao_autorizado`) | EXECUTE |
| `gerar_codigo_reserva()` | — | — | — (só uso interno) |
| `is_admin()` [base] | — | EXECUTE (retorna `false`) | EXECUTE |
| `configuracao` | — | RLS: nada | SELECT; UPDATE (`preco_centavos`, `reservas_abertas`) |
| `reservas` | — | RLS: nada | SELECT; UPDATE (`status_pagamento`, `status_entrega`, `nome`, `whatsapp`, `endereco`) só com `cancelada_em IS NULL` |
| `admins` | — | RLS: só a própria linha, se for o meio de checar admin | SELECT |
| `totais_venda` | — | nada | SELECT |
