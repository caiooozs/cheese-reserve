# Cheese Reserve Constitution

App pequeno e de uso pontual para a venda de queijos de fim de ano. Há dois públicos: clientes,
que reservam peças pelo link compartilhado no WhatsApp, e a administradora (a vendedora), que
acompanha e ajusta as reservas pelo painel.

> Palavras-chave: **DEVE** / **NÃO DEVE** = obrigatório; **DEVERIA** = recomendado (desviar
> exige justificativa no `plan.md`).

## Core Principles

### I. Simplicidade

Nenhuma abstração, camada ou dependência entra no projeto se o escopo atual não exigir.
"Pode ser útil depois" não é justificativa.

- A arquitetura é um único app Next.js falando com o Supabase, sem servidor ou API separados. As
  functions do Postgres são o backend das regras de negócio. O código segue a arquitetura descrita
  em Restrições Técnicas; NÃO DEVEM existir outras camadas (repositórios, adaptadores, injeção de
  dependência) em volta do cliente do Supabase.
- Toda nova dependência (pacote npm, serviço externo, extensão do Postgres) DEVE ser justificada
  no `plan.md` (tabela *Complexity Tracking*), dizendo qual alternativa mais simples foi
  descartada e por quê.
- Otimizações de desempenho ou de escala NÃO DEVEM ser feitas sem um problema medido.
- Antes de publicar para os clientes, dependências e componentes sem uso DEVEM ser removidos.

*Por quê:* é um app pequeno, de uma temporada, mantido por uma pessoa. Cada peça a mais é custo
de manutenção e superfície de erro sem retorno.

### II. Mobile-first

- Toda tela DEVE ser desenhada primeiro para celular (referência: 360px de largura) e funcionar
  sem rolagem horizontal e sem zoom. Telas maiores são adaptação, não ponto de partida.
- O fluxo do cliente DEVE funcionar no navegador interno do WhatsApp (Android e iOS), sem
  instalar app, criar conta ou fazer login.
- O painel da administradora DEVE ser plenamente operável pelo celular: ver, alterar e cancelar
  reservas sem precisar de computador.
- Alvos de toque DEVEM ter pelo menos 44×44px. Campos DEVEM abrir o teclado certo
  (`inputmode="tel"` para WhatsApp, numérico para quantidades).
- A página pública DEVERIA ter metadados Open Graph (título, descrição, imagem) para gerar uma
  prévia legível quando o link for compartilhado no WhatsApp.

*Por quê:* clientes e administradora usam quase só o celular, abrindo o link pelo WhatsApp.

### III. Integridade do Estoque

Nunca é possível reservar mais peças do que existem, mesmo com acessos simultâneos.

- Toda operação que mexe em estoque ou valores — reservar, alterar quantidade, cancelar e também
  ajustes de estoque ou de preço feitos pela administradora — DEVE ser uma function do Postgres
  executada numa única transação: ou tudo é aplicado, ou nada.
- A conferência de disponibilidade e a baixa do estoque DEVEM ser atômicas no banco (ex.:
  `UPDATE ... WHERE disponivel >= quantidade` ou trava de linha com `SELECT ... FOR UPDATE`).
  O padrão "ler, conferir no app, depois gravar" é proibido.
- O esquema DEVERIA ter uma barreira declarativa contra estoque negativo (ex.: `CHECK`), como
  última defesa caso uma function erre.
- Cancelar DEVE devolver as peças ao estoque na mesma transação. Alterar quantidade DEVE
  respeitar a disponibilidade atual. Reduzir o estoque de um produto abaixo do total já
  reservado DEVE ser recusado.
- O código do Next.js — páginas, componentes, services, Server Actions e Route Handlers — só exibe
  dados, valida para dar feedback imediato e chama as functions; NÃO DEVE conter regra de estoque
  ou de valores. Toda validação do front DEVE ser repetida na function, e a recusa do banco (ex.:
  "acabou enquanto você escolhia") DEVE virar uma mensagem clara para o usuário.

*Por quê:* só o banco enxerga todos os acessos ao mesmo tempo; concorrência resolvida em
qualquer outra camada falha. Uma única fonte da verdade evita regras divergentes.

### IV. Integridade dos Valores

- Todo valor em dinheiro DEVE ser armazenado e trafegado como inteiro em centavos (`integer` ou
  `bigint` no banco, número inteiro no código). Ponto flutuante NÃO DEVE ser usado para dinheiro
  em nenhuma camada.
- A conversão para reais acontece só na exibição. Valores digitados em reais (ex.: "45,90")
  DEVEM ser convertidos para centavos sem aritmética de ponto flutuante (nada de
  `parseFloat(x) * 100`).
- Ao criar uma reserva, o preço unitário vigente DEVE ser copiado para ela. Esse preço NÃO DEVE
  mudar depois — nem quando o preço do produto muda, nem quando a quantidade da reserva é
  alterada.
- O total de uma reserva DEVE ser calculado pelo banco a partir do preço copiado. Totais
  calculados no front são só prévia.

*Por quê:* centavos inteiros eliminam erro de arredondamento; o preço copiado garante que o
cliente paga o que viu ao reservar.

### V. Privacidade

- Do cliente coleta-se apenas nome, WhatsApp e, opcionalmente, endereço. Nenhum outro dado
  pessoal (CPF, e-mail, data de nascimento, localização etc.) DEVE ser pedido nem guardado.
- Nenhum dado de contato ou de pagamento da administradora (telefone, chave Pix, dados
  bancários) DEVE aparecer na parte pública — nem nas páginas, nem em metadados, nem em
  respostas de functions ou tabelas acessíveis ao `anon`, nem em variáveis `NEXT_PUBLIC_*` ou no
  JavaScript enviado ao navegador.
- O app NÃO DEVE processar pagamentos nem exibir instruções de pagamento: o pagamento é
  combinado em particular pelo WhatsApp.
- Dados de clientes só são visíveis para a administradora (Princípio VI). O que uma function
  pública devolve ao cliente NÃO DEVE incluir dados de outros clientes.

*Por quê:* coletar o mínimo reduz o dano de qualquer vazamento (em linha com a LGPD) e protege
os dados pessoais da administradora.

### VI. Segurança do Painel

Só a administradora acessa as reservas. O público não lê nem altera reservas diretamente, e as
permissões são garantidas no banco, não só na interface.

- RLS DEVE estar habilitada em toda tabela de schema exposto pela API do Supabase.
- O papel `anon` NÃO DEVE ter `SELECT`, `INSERT`, `UPDATE` nem `DELETE` em tabelas de reservas
  ou de clientes. O público só acessa o catálogo (colunas seguras) e as functions liberadas
  explicitamente com `GRANT EXECUTE`.
- Functions acessíveis ao `anon` NÃO DEVEM permitir listar reservas nem consultá-las por um
  identificador adivinhável.
- Estar autenticado não basta: políticas e functions administrativas DEVEM verificar que o
  usuário é a administradora (ex.: `auth.uid()` numa lista de administradores), e o cadastro
  público no Supabase Auth DEVE ficar desativado.
- Functions `SECURITY DEFINER` DEVEM fixar `search_path`, validar todos os parâmetros e ter
  `EXECUTE` revogado de `PUBLIC` (o Postgres concede por padrão) antes de liberar só aos papéis
  necessários.
- A chave `service_role` (ou qualquer chave que ignore RLS) NÃO DEVE chegar ao navegador; o app
  DEVERIA funcionar sem ela, usando a sessão da administradora.
- Esconder botões ou proteger rotas no Next.js é conveniência de interface, nunca o controle de
  acesso.

*Por quê:* a chave pública do Supabase vai junto com o site e qualquer pessoa pode usá-la para
chamar a API diretamente; o banco é a única barreira que não dá para contornar.

### VII. Português do Brasil e Linguagem Simples

- Todo texto visível DEVE estar em português do Brasil (`<html lang="pt-BR">`), incluindo erros,
  avisos, estados vazios e títulos de página.
- A linguagem DEVE ser simples, pensada para uma usuária não técnica: sem jargão ("RLS",
  "erro 500", "token", "status: pending"). Erros do banco ou do Supabase DEVEM ser traduzidos em
  mensagens que dizem o que aconteceu e o que fazer — nunca exibidos crus.
- Ações que desfazem trabalho no painel (ex.: cancelar reserva) DEVERIAM pedir confirmação,
  dizendo em palavras simples o que vai acontecer.
- Datas e horas DEVEM ser exibidas no fuso `America/Sao_Paulo`, informado explicitamente na
  formatação (o servidor pode rodar em UTC). No banco, instantes DEVEM ser `timestamptz`.
- Valores DEVEM ser exibidos em reais no formato brasileiro (`R$ 1.234,56`), por exemplo com
  `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

*Por quê:* a administradora não é da área técnica e todos os usuários são brasileiros; fuso
implícito mostra horários errados quando o servidor roda em outro fuso.

## Restrições Técnicas

- Stack já adotada no repositório: Next.js 16 (App Router), React 19 e TypeScript; Supabase
  (Postgres, Auth e RLS) via `@supabase/ssr`; Tailwind CSS 4 e componentes shadcn/ui. Trocar ou
  acrescentar peças segue o Princípio I.
- Arquitetura: MVVM com services e containers.
  - **Service** (`service/<domínio>/`): `<domínio>.service.ts` roda só no servidor (`server-only`)
    e é o único lugar que chama o Supabase. `<domínio>.actions.ts` guarda as Server Actions, que
    validam a entrada, conferem a sessão de admin e chamam o service.
  - **Componente** (`components/<nome>/`): cada um na sua pasta, com todos os arquivos do MVVM.
    Componente sem estado nem chamada a Server Action pode ter só a View.
  - **Model** (`<nome>.model.ts`): tipos, schemas e funções puras exclusivos do componente. O que é
    compartilhado com o service ou com outro componente fica em `lib/`.
  - **ViewModel** (`<nome>.viewmodel.ts`): hook sem JSX que concentra a lógica da tela. É o único
    que chama Server Actions no navegador.
  - **View** (`<nome>.view.tsx`): componente sem estado de negócio, que só desenha as props.
  - **Container** (`<nome>.container.tsx`): liga ViewModel e View, passando os grupos
    desestruturados do ViewModel (`dados`, `campos`, `acoes`) como props.
  - A leitura acontece em Server Components, que chamam o service e passam DTOs ao container.
- O esquema do banco, as functions, as políticas RLS e os grants DEVEM estar versionados como
  migrações SQL no repositório. Mudança feita só pelo painel do Supabase não conta como entregue.
- Segredos ficam fora do git (`.env.local`). Só a URL do Supabase e a chave pública podem usar o
  prefixo `NEXT_PUBLIC_`.

## Fluxo de Desenvolvimento e Qualidade

- Cada funcionalidade segue o Spec Kit: especificar → planejar → tarefas → implementar. O
  `plan.md` DEVE passar pela *Constitution Check* (Princípios I–VII) antes da pesquisa e de novo
  depois do design; desvios só com justificativa na tabela *Complexity Tracking*.
- A verificação é proporcional ao tamanho do app: não é preciso montar infraestrutura de testes
  além do necessário. Mas funcionalidades que mexem em estoque, valores ou permissões DEVEM ter
  verificação reproduzível (script SQL ou teste automatizado) antes de serem consideradas
  prontas, cobrindo o que se aplicar:
  - **Estoque e valores:** duas reservas simultâneas da última peça → só uma é aceita;
    quantidade acima do disponível → recusada; alterar quantidade e cancelar → estoque correto;
    mudar o preço do produto → reservas existentes mantêm o preço.
  - **Permissões:** como `anon` e como usuário autenticado que não é a administradora, não é
    possível ler nem alterar reservas ou dados de clientes.
- Toda tela DEVE ser conferida em largura de celular (~360px) antes de ser considerada pronta.
- Antes de publicar, DEVE-se confirmar que nenhum telefone ou chave Pix da administradora
  aparece no HTML, no JavaScript enviado ao navegador nem nas respostas públicas.

## Governance

- Esta constituição prevalece sobre qualquer outra prática do projeto. Em caso de conflito, ela
  vence ou é emendada — nunca ignorada em silêncio.
- Emendas são feitas neste arquivo (via `/speckit-constitution`), com Sync Impact Report, novo
  número de versão e data. Especificações e planos em andamento DEVEM ser revisados à luz da
  mudança.
- Versionamento semântico: **MAJOR** remove ou redefine um princípio de forma incompatível;
  **MINOR** adiciona princípio ou seção, ou amplia orientação de forma relevante; **PATCH**
  esclarece a redação sem mudar o sentido.
- Conformidade: todo `plan.md` checa os Princípios I–VII; toda revisão de código ou de entrega
  confere a conformidade; complexidade extra exige justificativa escrita.
- Orientações de execução para agentes ficam em `AGENTS.md` (por exemplo: consultar a
  documentação local do Next.js em `node_modules/next/dist/docs/` antes de escrever código).

**Version**: 2.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-30
