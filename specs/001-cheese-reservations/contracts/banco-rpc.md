# Contrato: Banco (RPC e acesso direto via API do Supabase)

Interface entre o app (sempre no servidor) e o Postgres do Supabase. Tipos TypeScript gerados
com `supabase gen types typescript` em `lib/database.types.ts`. Origem: **[base]** = já existe
(confirmar no `db pull`), **[novo]** = migration `<timestamp>_ajustes_spec.sql`.

Erros de regra chegam como `error.message` igual ao código (ex.: `estoque_insuficiente`),
levantados com `RAISE EXCEPTION '<codigo>'`.

## Functions chamadas como `anon` (página pública)

### `obter_vitrine()` — [base], retorno ampliado [novo]

- Parâmetros: nenhum.
- Retorno (uma linha):

  | Campo | Tipo | Observação |
  |-------|------|-----------|
  | `preco_centavos` | `integer` | `0` = ainda não abriram |
  | `estoque_disponivel` | `integer` | |
  | `reservas_abertas` | `boolean` | [novo] |

- Não expõe nada além disso (nenhum dado de reservas nem da vendedora).
- Também é o alvo do GitHub Action diário (`POST /rest/v1/rpc/obter_vitrine`).

### `criar_reserva(...)` — [base], assinatura nova [novo]

| Parâmetro | Tipo | Regra |
|-----------|------|-------|
| `p_nome` | `text` | 2–80 após `trim` |
| `p_whatsapp` | `text` | 10 ou 11 dígitos |
| `p_quantidade` | `integer` | 1–10 |
| `p_endereco` | `text NULL` | até 200; `NULL` se vazio |
| `p_preco_esperado_centavos` | `integer` | [novo] preço que o cliente viu |
| `p_chave_envio` | `uuid` | [novo] idempotência |

Ordem das checagens (tudo numa transação, com a linha de `configuracao` travada):

1. `chave_envio` já usada → devolve a reserva existente, sem novo efeito [novo]. Vem primeiro
   para que a repetição de um envio que deu certo nunca vire erro (mesmo que o preço ou a
   abertura tenham mudado depois).
2. `p_quantidade` fora de 1–10 → `quantidade_invalida`
3. `preco_centavos = 0` → `venda_fechada`
4. `reservas_abertas = false` → `reservas_encerradas` [novo]
5. `preco_centavos <> p_preco_esperado_centavos` → `preco_alterado` [novo]
6. `estoque_disponivel < p_quantidade` → `estoque_insuficiente`
7. dados do cliente inválidos → `dados_invalidos` [novo, se a baseline não validar]
8. Desconta o estoque, gera o código (falha após N tentativas → `codigo_indisponivel`) e insere
   a reserva com `preco_unitario_centavos = preco_centavos`.

Retorno (uma linha):

| Campo | Tipo |
|-------|------|
| `codigo` | `text` |
| `quantidade` | `integer` |
| `valor_total_centavos` | `integer` |
| `criada_em` | `timestamptz` |

A versão antiga (4 parâmetros) é removida (`DROP FUNCTION`), para não sobrar uma sobrecarga
chamável sem as novas checagens. Grants refeitos: `REVOKE ALL ... FROM PUBLIC`; `GRANT EXECUTE
... TO anon`.

## Functions do painel (admin)

Todas `SECURITY DEFINER`, `SET search_path`, `EXECUTE` revogado de `PUBLIC` e concedido a
`authenticated`; a primeira coisa que fazem é conferir se `auth.uid()` está em `admins`
(`nao_autorizado`).

### `alterar_quantidade(p_reserva_id, p_nova_quantidade)` — [base]

- Erros: `nao_autorizado`, `reserva_nao_encontrada`, `reserva_cancelada`, `reserva_paga`,
  `quantidade_invalida` (< 1), `estoque_insuficiente`.
- Efeito: estoque `− (nova − atual)`; o preço unitário não muda; o total é recalculado pela coluna
  gerada.
- Retorno: conforme a baseline; o app só precisa de sucesso ou erro.

### `cancelar_reserva(p_reserva_id)` — [base]

- Erros: `nao_autorizado`, `reserva_nao_encontrada`.
- Efeito: preenche `cancelada_em` e devolve `quantidade` ao estoque. Em reserva já cancelada,
  não faz nada (idempotente).

### `definir_estoque_total(p_total integer)` — [novo]

- Erros: `nao_autorizado`, `quantidade_invalida` (`p_total < 0`), `estoque_abaixo_do_reservado`.
- Efeito: `estoque_disponivel = p_total − pecas_reservadas`, sob a trava de `configuracao`.
- Retorno: `estoque_disponivel integer`, `pecas_reservadas integer`.

### `eh_admin()` — [novo, só se a baseline não tiver equivalente executável]

- Retorno: `boolean` (`auth.uid()` está em `admins`). Usada por `exigirAdmin()`.

## Acesso direto às tabelas (só admin, via RLS)

| Operação | Query (supabase-js) | Observação |
|----------|---------------------|-----------|
| Listar reservas | `from('reservas').select('<colunas da tela>').order('created_at', { ascending: false })` + filtros `eq`/`is` | colunas explícitas, nunca `*` |
| Buscar por código | `.eq('codigo', codigoNormalizado)` | código já em maiúsculas e sem espaços |
| Alternar pagamento | `update({ status_pagamento })` `.eq('id', id)` | RLS recusa se cancelada |
| Alternar entrega | `update({ status_entrega })` `.eq('id', id)` | idem |
| Corrigir dados | `update({ nome, whatsapp, endereco })` `.eq('id', id)` | [novo] grant de coluna; idem |
| Definir preço | `from('configuracao').update({ preco_centavos })` | `> 0` validado na action; `CHECK >= 0` no banco |
| Abrir/encerrar | `from('configuracao').update({ reservas_abertas })` | [novo] |
| Totais e peças | `from('totais_venda').select('recebido_centavos, a_receber_centavos, pecas_reservadas')` | |
| Configuração | `from('configuracao').select('preco_centavos, estoque_disponivel, reservas_abertas')` | |

Para `UPDATE`s que a RLS recusa em silêncio (0 linhas), a action pede `.select('id')` e trata
retorno vazio como "reserva cancelada ou não encontrada".

## Códigos de erro

| Código | Origem | Quem recebe |
|--------|--------|-------------|
| `quantidade_invalida` | [base] | público e painel |
| `venda_fechada` | [base] | público |
| `reservas_encerradas` | [novo] | público |
| `preco_alterado` | [novo] | público |
| `estoque_insuficiente` | [base] | público e painel |
| `codigo_indisponivel` | [base] | público |
| `dados_invalidos` | [novo, se preciso] | público e painel |
| `reserva_nao_encontrada` | [base] | painel |
| `reserva_cancelada` | [base] | painel |
| `reserva_paga` | [base] | painel |
| `estoque_abaixo_do_reservado` | [novo] | painel |
| `nao_autorizado` | [base] | painel |

As mensagens em português estão em [server-actions.md](./server-actions.md#mensagens-de-erro).
