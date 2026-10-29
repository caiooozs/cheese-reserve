# Quickstart: validar a Reserva de Queijos

Guia para preparar o ambiente e provar, ponta a ponta, que a feature funciona. Detalhes de dados
e interfaces: [data-model.md](./data-model.md), [contracts/banco-rpc.md](./contracts/banco-rpc.md)
e [contracts/server-actions.md](./contracts/server-actions.md).

## Pré-requisitos

- Node.js 20+ e npm.
- Docker Desktop rodando (exigido por `supabase db pull` e pelo banco local de testes).
- Supabase CLI como dependência de desenvolvimento (`npx supabase ...`).
- Acesso ao projeto Supabase remoto (ref do projeto e senha do banco).

## 1. Trazer o banco remoto para o repositório (uma vez)

```bash
npx supabase init                      # cria supabase/ (config.toml)
npx supabase link --project-ref <ref>
npx supabase db pull                   # gera supabase/migrations/<ts>_remote_schema.sql
                                       # e marca como aplicada no histórico remoto
```

Esperado: um arquivo de baseline em `supabase/migrations/`. Conferir os itens V1–V10 de
[research.md](./research.md#r1-o-schema-do-banco-ainda-não-está-no-repositório) e anotar
qualquer lacuna para a migration de ajustes.

## 2. Variáveis de ambiente

Em `.env.local` (e na Vercel), **sem** o prefixo `NEXT_PUBLIC_`:

```text
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
```

Renomear as variáveis `NEXT_PUBLIC_SUPABASE_*` que existem hoje. Nunca configurar a chave
`service_role`.

## 3. Banco local e testes de integração

```bash
npx supabase start          # sobe o stack local (Docker)
npx supabase db reset       # aplica baseline + ajustes + supabase/seed.sql
npm run test:integracao
```

Esperado (todos verdes):

| Cenário | Resultado esperado |
|---------|--------------------|
| Código retornado | 6 caracteres, só `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, com letra e número |
| Duas reservas simultâneas da última peça | exatamente 1 sucesso; a outra `estoque_insuficiente` |
| Quantidade 10 / 11 | aceita / `quantidade_invalida` |
| Preço esperado diferente | `preco_alterado`, nada criado |
| Reservas encerradas | `reservas_encerradas`, nada criado |
| Mesma `chave_envio` duas vezes | uma reserva só; segunda chamada devolve o mesmo código |
| Alterar quantidade | aumenta com estoque; recusa sem estoque; diminui devolvendo; recusa reserva paga |
| Cancelar | devolve estoque; repetir não muda nada; reserva sai dos totais |
| `definir_estoque_total` abaixo do reservado | `estoque_abaixo_do_reservado`, nada muda |
| RLS | `anon` e usuário comum não leem nem alteram reservas; admin não altera reserva cancelada |

Depois de verde localmente, aplicar no remoto e gerar os tipos:

```bash
npx supabase db push
npx supabase gen types typescript --linked > lib/database.types.ts
```

## 4. Testes unitários

```bash
npm run test:unit
```

Cobre schemas zod, WhatsApp, código da busca, texto do comprovante, moeda, data, conversão de
reais para centavos e mensagens de erro.

## 5. Build e verificação do bundle

```bash
npm run build
node scripts/verificar-bundle.mjs
```

Esperado: o build passa (inclusive com `server-only` barrando imports indevidos) e o script não
encontra os valores de `SUPABASE_URL` nem de `SUPABASE_PUBLISHABLE_KEY` em `.next/static`.

## 6. Configuração manual de produção (uma vez)

1. Supabase Auth: criar a usuária da vendedora (e-mail e senha).
2. SQL: `insert into admins (user_id) values ('<uuid da usuária>');`
3. Auth → desativar novos cadastros (sign-ups).
4. Vercel: `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`.
5. GitHub: secrets `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`; rodar o workflow
   `manter-ativo` manualmente uma vez e confirmar sucesso.

## 7. Validação manual no celular (largura 360px e navegador do WhatsApp)

Rodar `npm run dev` (ou usar o deploy) e abrir pelo celular, de preferência pelo link enviado no
WhatsApp.

**História 1: cliente reserva**

1. Com preço 0: a página diz que as reservas ainda não abriram.
2. Definir preço e total no painel; recarregar: aparecem preço, disponível e formulário.
3. Enviar vazio: erros aparecem em cada campo.
4. Reservar 2 peças sem endereço: comprovante com código, total e "combinar pelo WhatsApp" cabe
   na tela; "Copiar" funciona; "Compartilhar" abre as opções do celular.
5. Conferir que nenhuma parte da página mostra telefone ou chave Pix.

**História 2: painel**

1. Abrir `/admin` sem login: vai para o login.
2. Entrar; buscar o código do passo anterior digitando em minúsculas e com espaço: a reserva
   aparece.
3. Marcar como pago: "Recebido" sobe e "A receber" desce. Filtrar "pagas e não entregues".
4. Tocar no atalho de WhatsApp: abre a conversa com o número do cliente.

**História 3: preço, estoque e abertura**

1. Mudar o preço: reservas antigas mantêm o valor.
2. Tentar total menor que o reservado: recusado com o número de peças reservadas.
3. Encerrar as reservas: a página pública mostra "encerradas"; reabrir: volta o formulário.

**História 4: correções**

1. Alterar a quantidade de uma reserva pendente (para mais e para menos) e conferir o estoque.
2. Corrigir o WhatsApp de uma reserva e usar o atalho.
3. Cancelar uma reserva paga: aparece o aviso de devolução; ela fica como cancelada, sem ações, e
   sai de "Recebido".
