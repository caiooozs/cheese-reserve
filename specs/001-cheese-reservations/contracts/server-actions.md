# Contrato: Rotas, Server Actions e DTOs

Interface entre o navegador e o servidor. Regras gerais:

- Toda Server Action é um endpoint público: valida a entrada com zod (`lib/schemas.ts`) antes de
  qualquer coisa; as do painel chamam `exigirAdmin()` antes de tocar no banco.
- O navegador nunca recebe URL, chave ou client do Supabase, nem linhas inteiras do banco: só os
  DTOs abaixo.
- Erros do Supabase nunca chegam crus: viram `{ ok: false, mensagem }` com texto da tabela
  [Mensagens de erro](#mensagens-de-erro). No servidor, o log guarda só `code` e `message`.
- Datas trafegam como string ISO; a formatação acontece na renderização.

## Rotas

| Rota | Tipo | Acesso | Conteúdo |
|------|------|--------|----------|
| `/` | Server Component + `<Suspense>` | público | Casca estática + vitrine (estado da venda ou formulário); comprovante após reservar |
| `/admin/login` | Server Component + form client | público | E-mail e senha |
| `/admin` | Server Component + `<Suspense>` | admin (`exigirAdmin()`) | Totais, peças, configurações, busca, filtros e lista |

`/admin` aceita `searchParams` (todos opcionais):

| Parâmetro | Valores | Efeito |
|-----------|---------|--------|
| `codigo` | texto | normalizado (maiúsculas, sem espaços); busca exata |
| `pagamento` | `pendente` \| `pago` | filtra ativas por pagamento |
| `entrega` | `pendente` \| `entregue` | filtra ativas por entrega |
| `situacao` | `ativas` (padrão) \| `canceladas` \| `todas` | |

`proxy.ts` (`matcher: ['/admin/:path*']`): renova a sessão; sem sessão, redireciona para
`/admin/login` (exceto a própria `/admin/login`).

## DTOs (servidor → navegador)

```ts
type VitrineDTO = {
  precoCentavos: number        // 0 = ainda não abriram
  disponivel: number
  reservasAbertas: boolean
}

type ComprovanteDTO = {
  codigo: string
  nome: string
  quantidade: number
  valorTotalCentavos: number
  endereco: string | null
  criadaEm: string             // ISO
}

type ReservaPainelDTO = {
  id: string
  codigo: string
  nome: string
  whatsapp: string             // só dígitos, sem 55
  endereco: string | null
  quantidade: number
  valorTotalCentavos: number
  criadaEm: string
  statusPagamento: 'pendente' | 'pago'
  statusEntrega: 'pendente' | 'entregue'
  cancelada: boolean
}

type ResumoPainelDTO = {
  recebidoCentavos: number
  aReceberCentavos: number
  precoCentavos: number
  disponivel: number
  reservadas: number
  total: number                // disponivel + reservadas
  reservasAbertas: boolean
}

type ResultadoAcao = { ok: true } | { ok: false; mensagem: string }
```

## Página pública — `app/actions.ts`

### `reservar(entrada)`

Entrada:

| Campo | Regra (zod) |
|-------|-------------|
| `nome` | string, `trim`, 2–80 |
| `whatsapp` | string; normalizada para dígitos (sem `55` inicial); 10 ou 11 dígitos |
| `quantidade` | inteiro 1–10 (no navegador também `<= disponivel`) |
| `endereco` | string opcional, `trim`, até 200; vazio → `null` |
| `precoEsperadoCentavos` | inteiro > 0 |
| `chaveEnvio` | UUID |
| `site` | honeypot; deve vir vazio |

Saída:

```ts
type ResultadoReserva =
  | { ok: true; comprovante: ComprovanteDTO }
  | { ok: true; comprovante: null }                              // honeypot preenchido
  | { ok: false; erro: 'validacao'; campos: Partial<Record<'nome' | 'whatsapp' | 'quantidade' | 'endereco', string>> }
  | { ok: false; erro: CodigoErroPublico; mensagem: string; vitrine?: VitrineDTO }
```

- `vitrine` acompanha `preco_alterado`, `estoque_insuficiente`, `reservas_encerradas` e
  `venda_fechada` (lida de novo com `obter_vitrine`), para a tela se atualizar.
- `comprovante.nome` e `comprovante.endereco` vêm da entrada já normalizada; os demais campos vêm
  do retorno de `criar_reserva`.
- Depois de criar: `revalidatePath('/')` e `revalidatePath('/admin')`.

## Login — `app/admin/login/actions.ts`

| Action | Entrada | Saída |
|--------|---------|-------|
| `entrar` | `{ email: string (e-mail), senha: string (mín. 1) }` | sucesso → `redirect('/admin')`; erro → `{ ok: false, mensagem: 'E-mail ou senha incorretos.' }` (mesma mensagem para qualquer falha de credencial) |
| `sair` | — | `signOut()` → `redirect('/admin/login')` |

## Painel — `app/admin/actions.ts`

Todas chamam `exigirAdmin()` primeiro, devolvem `ResultadoAcao` e, em sucesso, chamam
`revalidatePath('/admin')` (e `revalidatePath('/')` quando muda vitrine).

| Action | Entrada (zod) | Banco | Revalida `/` |
|--------|---------------|-------|--------------|
| `definirPagamento` | `{ id: uuid, status: 'pendente' \| 'pago' }` | `UPDATE reservas` | não |
| `definirEntrega` | `{ id: uuid, status: 'pendente' \| 'entregue' }` | `UPDATE reservas` | não |
| `alterarQuantidade` | `{ id: uuid, quantidade: int >= 1 }` | `alterar_quantidade` | sim |
| `cancelarReserva` | `{ id: uuid }` | `cancelar_reserva` | sim |
| `corrigirDados` | `{ id: uuid, nome, whatsapp, endereco }` (mesmas regras de `reservar`) | `UPDATE reservas` | não |
| `definirPreco` | `{ preco: string em reais, ex. "45,90" }` → `reaisParaCentavos` → > 0 | `UPDATE configuracao` | sim |
| `definirEstoqueTotal` | `{ total: int >= 0 }` | `definir_estoque_total` | sim |
| `definirReservasAbertas` | `{ abertas: boolean }` | `UPDATE configuracao` | sim |

Os toggles de pagamento e entrega usam `useOptimistic` no cliente; se a action falhar, o estado
volta e aparece um toast com a mensagem.

## Atalho de WhatsApp

`https://wa.me/55<whatsapp>` (dígitos já normalizados), aberto em nova aba/app. Função pura
`linkWhatsApp(digitos)` em `lib/whatsapp.ts`.

## Texto do comprovante

Gerado por `textoComprovante(c: ComprovanteDTO)` em `lib/comprovante.ts` (função pura):

```text
Reserva de queijo K7M2QX
Nome: Maria Silva
Quantidade: 2 peças
Total: R$ 100,00
Entrega: Rua A, 10
Feita em 29/10/2026 às 15:02
```

- `Quantidade: 1 peça` no singular.
- A linha `Entrega:` só aparece com endereço. O cartão na tela, sem endereço, mostra "Entrega:
  combinar pelo WhatsApp" (FR-010); o texto compartilhado omite a linha.
- Data e hora no fuso `America/Sao_Paulo`.

Instrução abaixo do cartão: "Envie este comprovante para a vendedora pelo WhatsApp. Ela vai
responder com os dados para pagamento." Sem telefone nem chave Pix (FR-013/015).

## Mensagens de erro

`traduzirErro(codigo)` em `lib/erros.ts`:

| Código | Mensagem |
|--------|----------|
| `quantidade_invalida` | Escolha uma quantidade válida. |
| `venda_fechada` | As reservas ainda não abriram. |
| `reservas_encerradas` | As reservas foram encerradas. |
| `preco_alterado` | O preço mudou enquanto você preenchia. Confira o novo valor e confirme de novo. |
| `estoque_insuficiente` | Não há peças suficientes. Veja quantas ainda estão disponíveis. |
| `codigo_indisponivel` | Não foi possível concluir agora. Tente de novo em instantes. |
| `dados_invalidos` | Confira os dados preenchidos. |
| `reserva_nao_encontrada` | Reserva não encontrada. |
| `reserva_cancelada` | Esta reserva foi cancelada e não pode ser alterada. |
| `reserva_paga` | Esta reserva já está paga. Para mudar a quantidade, marque o pagamento como pendente antes. |
| `estoque_abaixo_do_reservado` | O total não pode ser menor que as {n} peças já reservadas. (`n` lido de `totais_venda` pela action, FR-035) |
| `nao_autorizado` | Sua sessão expirou. Entre de novo. |
| (qualquer outro) | Algo deu errado. Tente de novo em instantes. |
