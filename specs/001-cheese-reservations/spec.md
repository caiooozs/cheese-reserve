# Feature Specification: Reserva de Queijos de Fim de Ano

**Feature Branch**: — (sem branch dedicada; spec em `specs/001-cheese-reservations`)

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "App de reserva de queijos para a venda de fim de ano: um único
produto vendido por peça, com página pública de reserva (sem login) e painel administrativo para a
vendedora. Descrição completa fornecida via /speckit-specify em 2026-10-29."

## Clarifications

### Session 2026-10-29

- Q: A vendedora pode corrigir os dados do cliente (nome, WhatsApp, endereço) de uma reserva no
  painel? → A: Sim — os três, enquanto a reserva estiver ativa (paga ou não), com as mesmas
  validações do formulário público; reservas canceladas continuam travadas.
- Q: Como a vendedora encerra as reservas antes de acabar o estoque? → A: Com um botão
  abrir/encerrar no painel; encerradas, a página mostra "reservas encerradas" e não aceita novas
  reservas; ela pode reabrir quando quiser.
- Q: Deve haver proteção contra reservas falsas em massa além do limite de peças por reserva?
  → A: Não; a vendedora cancela reservas suspeitas pelo painel, e nenhum dado extra (como IP) é
  coletado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cliente reserva queijos pela página pública (Priority: P1)

Uma pessoa recebe o link pelo WhatsApp, abre no celular e vê o queijo, o preço por peça e quantas
peças ainda restam. Preenche nome, WhatsApp, quantidade e, se quiser, o endereço de entrega, e
confirma. Recebe um comprovante com um código de reserva, fácil de tirar print, compartilhar ou
copiar, e a orientação de enviar esse comprovante para a vendedora pelo WhatsApp, que responde com
os dados para pagamento.

**Why this priority**: é o coração da venda. Sem a reserva pública não há o que administrar, e só
com ela (preço e estoque definidos previamente) a vendedora já consegue receber pedidos com
garantia de que não vende mais do que tem.

**Independent Test**: com preço e estoque já definidos, abrir a página no celular, fazer uma
reserva e conferir que o comprovante aparece, que o estoque disponível diminuiu e que não é
possível reservar além do disponível ou do limite por reserva.

**Acceptance Scenarios**:

1. **Dado** que o preço está definido e há 20 peças disponíveis, **Quando** o cliente abre a
   página, **Então** vê o produto, o preço por peça em R$ e a indicação de 20 peças disponíveis.
2. **Dado** o formulário preenchido com nome, WhatsApp válido e quantidade 2 (dentro do limite e
   do disponível), **Quando** o cliente confirma, **Então** a reserva é criada, as peças
   disponíveis diminuem em 2 e aparece o comprovante com código, nome, quantidade, valor total
   (2 × preço por peça), endereço (se informado) e data e hora.
3. **Dado** uma reserva feita sem endereço, **Quando** o comprovante é exibido, **Então** ele
   informa que a entrega será combinada pelo WhatsApp.
4. **Dado** o comprovante na tela, **Quando** o cliente toca em "Compartilhar", **Então** abrem as
   opções de compartilhamento do celular (como o WhatsApp) com o texto do comprovante; **Quando**
   toca em "Copiar", **Então** o texto do comprovante é copiado e a tela confirma a cópia.
5. **Dado** o comprovante na tela, **Então** há a orientação de enviá-lo para a vendedora pelo
   WhatsApp, e em nenhum ponto da página aparecem o telefone dela ou chave Pix.
6. **Dado** o formulário com nome vazio, WhatsApp inválido ou quantidade fora do permitido (0,
   mais de 10 ou mais que o disponível), **Quando** o cliente tenta confirmar, **Então** a reserva
   não é enviada e cada erro aparece no próprio campo, em linguagem simples.
7. **Dado** que o preço por peça ainda não foi definido, **Quando** o cliente abre a página,
   **Então** vê o aviso de que as reservas ainda não abriram e não há formulário.
8. **Dado** que não há peças disponíveis, **Quando** o cliente abre a página, **Então** vê o aviso
   de que esgotou e não há formulário.
9. **Dado** que a vendedora encerrou as reservas, **Quando** o cliente abre a página, **Então** vê
   o aviso de que as reservas estão encerradas e não há formulário, mesmo havendo peças.
10. **Dado** que restam 3 peças, **Quando** dois clientes confirmam reservas de 3 peças ao mesmo
    tempo, **Então** só o primeiro consegue, e o segundo recebe um aviso de estoque insuficiente
    com a quantidade disponível no momento.

---

### User Story 2 - Vendedora acompanha e confere as reservas (Priority: P2)

A vendedora entra no painel pelo celular, vê todas as reservas, busca pelo código de um
comprovante recebido para conferir os dados, marca pagamento e entrega, filtra o que falta fazer
(por exemplo, pagas e ainda não entregues), abre a conversa de WhatsApp de um cliente e acompanha
quanto já recebeu e quanto ainda vai receber.

**Why this priority**: sem o painel, a vendedora não sabe quem reservou nem consegue conferir os
comprovantes antes de enviar os dados de pagamento.

**Independent Test**: com algumas reservas existentes, entrar no painel, buscar uma reserva pelo
código, alternar os status de pagamento e entrega, aplicar filtros e conferir que os totais
"Recebido" e "A receber" batem com as reservas.

**Acceptance Scenarios**:

1. **Dado** alguém sem login, **Quando** tenta abrir o painel, **Então** é levado ao login e não
   vê nenhuma reserva nem dado de cliente.
2. **Dado** a vendedora logada, **Quando** abre o painel, **Então** vê a lista de reservas, das
   mais recentes para as mais antigas, com código, nome, WhatsApp, endereço (quando informado),
   quantidade, valor total, data e hora, status de pagamento e status de entrega.
3. **Dado** um comprovante com o código "K7P2XQ", **Quando** ela busca por "k7p2xq" ou
   "K7P 2XQ", **Então** a reserva correspondente aparece.
4. **Dado** uma reserva ativa com pagamento pendente de R$ 100,00, **Quando** ela marca como pago,
   **Então** "Recebido" aumenta R$ 100,00 e "A receber" diminui R$ 100,00.
5. **Dado** uma reserva marcada como paga por engano, **Quando** ela volta o pagamento para
   pendente, **Então** a reserva e os totais voltam ao estado anterior.
6. **Dado** reservas em vários status, **Quando** ela filtra "pagas e não entregues", **Então** só
   aparecem reservas ativas pagas com entrega pendente.
7. **Dado** uma reserva na lista, **Quando** ela toca no atalho de WhatsApp, **Então** abre a
   conversa com o número do cliente.

---

### User Story 3 - Vendedora define o preço e o estoque (Priority: P3)

A vendedora define o preço por peça (o que abre as reservas) e informa o total de queijos que tem
para vender, ajustando esses valores ao longo da temporada. O painel mostra o total, quantas peças
já estão reservadas e quantas ainda estão disponíveis. Quando quiser parar de vender, ela encerra
as reservas por um botão no painel, e pode reabri-las depois.

**Why this priority**: preço e estoque podem ser definidos uma vez antes da abertura; a edição
pelo painel dá autonomia à vendedora para ajustes ao longo da temporada.

**Independent Test**: no painel, definir preço e estoque e conferir que a página pública passa a
aceitar reservas; alterar o preço e conferir que reservas antigas mantêm o valor original.

**Acceptance Scenarios**:

1. **Dado** que o preço ainda não foi definido, **Quando** ela define R$ 45,90 por peça,
   **Então** a página pública passa a exibir esse preço e a aceitar reservas.
2. **Dado** reservas feitas a R$ 45,90, **Quando** ela muda o preço para R$ 50,00, **Então** as
   reservas existentes continuam com R$ 45,90 por peça e os mesmos totais, e as novas reservas usam
   R$ 50,00.
3. **Dado** um total de 60 queijos e 42 peças em reservas ativas, **Quando** ela abre o estoque,
   **Então** vê total 60, reservados 42 e disponíveis 18.
4. **Dado** 10 peças em reservas ativas, **Quando** ela tenta mudar o total para 8, **Então** o
   ajuste é recusado com aviso de que 10 peças já estão reservadas, e nada muda.
5. **Dado** total de 20 e 20 peças reservadas (esgotado), **Quando** ela muda o total para 30,
   **Então** ficam 10 peças disponíveis e a página pública volta a aceitar reservas.
6. **Dado** reservas abertas e peças disponíveis, **Quando** ela encerra as reservas, **Então** a
   página pública passa a mostrar "reservas encerradas" e não aceita novas reservas, enquanto o
   painel continua permitindo acompanhar, corrigir e cancelar as reservas existentes.
7. **Dado** reservas encerradas, **Quando** ela reabre, **Então** a página volta a aceitar
   reservas, respeitando preço e peças disponíveis.

---

### User Story 4 - Vendedora corrige ou cancela reservas (Priority: P4)

A vendedora ajusta a quantidade de uma reserva ainda não paga (o cliente pediu mais ou menos
peças), corrige nome, WhatsApp ou endereço de uma reserva ativa (o cliente digitou errado ou mudou
o local de entrega) ou cancela uma reserva (o cliente desistiu), com as peças voltando para o
estoque.

**Why this priority**: são correções menos frequentes; até existirem, um cliente que quer mais
peças pode fazer nova reserva.

**Independent Test**: com uma reserva pendente, aumentar e diminuir a quantidade conferindo
estoque e valor total; cancelar uma reserva e conferir que as peças voltaram, que ela saiu dos
totais e que continua visível como cancelada.

**Acceptance Scenarios**:

1. **Dado** uma reserva ativa e pendente de 2 peças a R$ 45,90 e 5 peças disponíveis, **Quando**
   ela altera para 4 peças, **Então** restam 3 disponíveis e o total passa a 4 × R$ 45,90, mesmo
   que o preço atual seja outro.
2. **Dado** uma reserva ativa e pendente de 4 peças, **Quando** ela diminui para 1, **Então** 3
   peças voltam para o estoque disponível.
3. **Dado** uma reserva pendente de 2 peças e só 1 peça disponível, **Quando** ela tenta aumentar
   para 5, **Então** a alteração é recusada com aviso de estoque insuficiente e a reserva continua
   com 2 peças.
4. **Dado** estoque suficiente, **Quando** ela altera uma reserva para 12 peças (acima do limite
   de 10 do formulário público), **Então** a alteração é aceita.
5. **Dado** uma reserva paga ou cancelada, **Então** a opção de alterar a quantidade não está
   disponível.
6. **Dado** uma reserva ativa, **Quando** ela pede para cancelar, **Então** o painel pede
   confirmação; ao confirmar, as peças voltam para o estoque, a reserva sai dos totais e continua
   na lista marcada como cancelada, sem opção de editar ou mudar status.
7. **Dado** uma reserva já paga, **Quando** ela pede para cancelar, **Então** a confirmação avisa
   que o valor precisa ser devolvido ao cliente; ao confirmar, a reserva deixa de contar em
   "Recebido".
8. **Dado** uma reserva ativa (paga ou não) com o WhatsApp digitado errado, **Quando** ela corrige
   o número, **Então** a lista e o atalho de WhatsApp passam a usar o número novo; código,
   quantidade, valores e status não mudam.
9. **Dado** uma correção com nome vazio ou WhatsApp inválido, **Quando** ela tenta salvar,
   **Então** a correção é recusada com o erro no próprio campo e a reserva fica como estava.
10. **Dado** uma reserva cancelada, **Então** a opção de corrigir os dados do cliente não está
    disponível.

---

### Edge Cases

- **Últimas peças disputadas ao mesmo tempo**: só a primeira reserva confirmada é aceita; a outra
  recebe aviso de estoque insuficiente, com a quantidade disponível naquele momento, e pode tentar
  de novo com uma quantidade menor.
- **Estoque mudou enquanto o cliente preenchia**: a confirmação sempre confere a disponibilidade
  atual; se não houver peças suficientes, a reserva é recusada com aviso e a quantidade atual.
- **Preço mudou enquanto o cliente preenchia**: a reserva não é concluída com um preço diferente
  do que o cliente viu; a página mostra o novo preço e o novo total e pede nova confirmação.
- **Toque duplo em "Reservar" ou conexão instável**: um mesmo envio nunca gera duas reservas.
- **Cliente fecha a página sem enviar o comprovante**: a reserva continua no painel e a vendedora
  pode chamar o cliente pelo WhatsApp dele. O comprovante não pode ser consultado de novo pela
  página pública.
- **Comprovante com dados diferentes do painel**: vale o que está no painel; a vendedora confere
  pelo código antes de enviar os dados de pagamento e, se o cliente avisar de um erro de nome,
  WhatsApp ou endereço, corrige no painel.
- **Aumentar quantidade sem peças suficientes**: a alteração é recusada com aviso e a reserva fica
  como estava.
- **Cliente que já pagou quer mais peças**: faz uma nova reserva pelo formulário.
- **Cancelar reserva já paga**: permitido, com aviso de que o valor precisa ser devolvido; a
  reserva deixa de contar em "Recebido".
- **Cancelamento devolve peças com a página esgotada**: se as reservas estiverem abertas, a página
  pública volta a aceitar reservas para as peças devolvidas.
- **Vendedora encerra as reservas enquanto um cliente preenche o formulário**: a confirmação é
  recusada com o aviso de que as reservas foram encerradas; nenhuma reserva é criada.
- **Vendedora ajusta o total enquanto um cliente reserva**: como ela edita o total (e não o
  disponível), as duas ações não se atrapalham; se o novo total ficar abaixo do que está
  reservado naquele instante, o ajuste é recusado.
- **WhatsApp digitado com formatação** ("(11) 98765-4321", "+55 11 98765-4321"): é aceito e
  guardado de forma padronizada; o atalho de WhatsApp do painel funciona com ele.
- **Celular sem opção de compartilhar**: o botão de copiar continua disponível e o comprovante
  continua legível para print.
- **Acesso ao painel ou aos dados de reservas sem login**: negado, mesmo tentando acessar os dados
  por fora da interface.
- **Muitas reservas falsas feitas por alguém de fora**: não há bloqueio automático; a vendedora
  cancela as suspeitas pelo painel e as peças voltam para o estoque.

## Requirements *(mandatory)*

### Functional Requirements

**Página pública**

- **FR-001**: A página pública DEVE ser acessível sem login e mostrar o produto (nome e
  descrição), o preço por peça em R$ e quantas peças ainda estão disponíveis.
- **FR-002**: Enquanto o preço por peça não estiver definido, a página DEVE informar que as
  reservas ainda não abriram e NÃO DEVE exibir o formulário nem aceitar reservas.
- **FR-003**: Quando não houver peças disponíveis, a página DEVE informar que esgotou e NÃO DEVE
  aceitar reservas.
- **FR-004**: O formulário de reserva DEVE ter exatamente estes campos: nome (obrigatório),
  WhatsApp (obrigatório), quantidade de queijos (obrigatório) e endereço de entrega (opcional;
  se vazio, a entrega é combinada pelo WhatsApp).
- **FR-005**: O formulário DEVE validar antes de enviar e mostrar cada erro no próprio campo:
  - nome: de 2 a 80 caracteres, sem contar espaços no início e no fim (só espaços conta como
    vazio);
  - WhatsApp: número brasileiro com DDD, com 10 ou 11 dígitos, aceitando o código do país (55) e
    ignorando espaços, parênteses, hífens e "+";
  - quantidade: número inteiro de 1 até o menor valor entre o limite por reserva e as peças
    disponíveis;
  - endereço: opcional, até 200 caracteres.
- **FR-006**: O limite máximo por reserva no formulário público DEVE ser de 10 peças, valor fixo
  definido na preparação do app (não editável pelo painel).
- **FR-007**: Antes da confirmação, a página DEVE mostrar o valor total correspondente à
  quantidade escolhida.
- **FR-008**: Ao confirmar, o sistema DEVE conferir de novo se as reservas estão abertas, a
  disponibilidade, o limite por reserva e o preço vigente. Se as reservas tiverem sido
  encerradas, DEVE recusar com o aviso correspondente. Se não houver peças suficientes, DEVE
  recusar com aviso de estoque insuficiente e a quantidade disponível atual; se o preço tiver
  mudado, DEVE mostrar o novo preço e o novo total e pedir nova confirmação.
- **FR-009**: Um mesmo envio do formulário (toque duplo, reenvio por conexão instável) NÃO DEVE
  gerar mais de uma reserva.

**Comprovante e código**

- **FR-010**: Após a reserva, a página DEVE mostrar um comprovante com código da reserva, nome,
  quantidade, valor total, endereço (ou a indicação de que a entrega será combinada pelo
  WhatsApp) e data e hora da reserva no horário de Brasília.
- **FR-011**: O comprovante DEVE caber inteiro numa tela de celular, para ser capturado num único
  print.
- **FR-012**: O comprovante DEVE ter um botão "Compartilhar", que abre as opções de
  compartilhamento do celular com o texto do comprovante, e um botão "Copiar", que copia esse
  texto e confirma a cópia na tela. Se o aparelho não oferecer compartilhamento, o botão
  "Copiar" DEVE continuar disponível.
- **FR-013**: O comprovante DEVE orientar o cliente a enviá-lo para a vendedora pelo WhatsApp,
  informando que ela responderá com os dados para pagamento.
- **FR-014**: O código da reserva DEVE ter 6 caracteres aleatórios entre letras maiúsculas e
  números, ser único entre todas as reservas, não seguir sequência e não permitir deduzir quantas
  reservas já foram feitas. Caracteres fáceis de confundir (como O e 0, I e 1) NÃO DEVEM ser
  usados.

**Privacidade da parte pública**

- **FR-015**: A parte pública NÃO DEVE exibir telefone, chave Pix nem qualquer dado de contato ou
  de pagamento da vendedora.
- **FR-016**: A parte pública NÃO DEVE permitir listar nem consultar reservas, nem exibir dados de
  outros clientes; o comprovante só é mostrado a quem acabou de fazer a reserva.
- **FR-017**: Do cliente DEVEM ser coletados apenas nome, WhatsApp e, opcionalmente, endereço.

**Painel: acesso**

- **FR-018**: O painel DEVE exigir login e ser acessível apenas pela vendedora (uma única conta);
  NÃO DEVE existir cadastro de novas contas.
- **FR-019**: Sem login válido, nenhuma reserva ou dado de cliente DEVE ser visível ou alterável,
  nem pela interface nem por acesso direto aos dados.
- **FR-020**: A vendedora DEVE permanecer conectada no próprio celular entre usos, sem precisar
  entrar a cada visita, e DEVE ter a opção de sair.

**Painel: lista, busca e acompanhamento**

- **FR-021**: O painel DEVE listar as reservas, das mais recentes para as mais antigas, com
  código, nome, WhatsApp, endereço (quando informado), quantidade, valor total, data e hora,
  status de pagamento e status de entrega; reservas canceladas DEVEM aparecer marcadas como
  canceladas.
- **FR-022**: O painel DEVE permitir buscar uma reserva pelo código, sem diferenciar maiúsculas
  de minúsculas e ignorando espaços.
- **FR-023**: O painel DEVE permitir filtrar por pagamento (pendente/pago), por entrega
  (pendente/entregue) e por situação (ativa/cancelada), combinando os filtros (ex.: pagas e não
  entregues).
- **FR-024**: Cada reserva DEVE ter um atalho que abre a conversa de WhatsApp com o número do
  cliente.
- **FR-025**: O painel DEVE mostrar dois totais em R$, sempre sobre todas as reservas
  (independentemente dos filtros): "Recebido", a soma das reservas ativas pagas, e "A receber",
  a soma das reservas ativas com pagamento pendente. Reservas canceladas NÃO DEVEM entrar em
  nenhum dos dois.
- **FR-026**: O painel DEVE mostrar o total de queijos, quantas peças estão em reservas ativas e
  quantas estão disponíveis.

**Painel: status e alterações de reservas**

- **FR-027**: Toda reserva DEVE nascer ativa, com pagamento pendente e entrega pendente. Os dois
  status são independentes e a vendedora DEVE poder alternar cada um a qualquer momento enquanto
  a reserva estiver ativa, em qualquer combinação.
- **FR-028**: A vendedora DEVE poder alterar a quantidade de uma reserva ativa com pagamento
  pendente: aumentar só se houver peças disponíveis (senão, a alteração é recusada com aviso e a
  reserva fica como estava); diminuir devolve as peças ao estoque. A quantidade mínima é 1 (para
  zerar, cancela-se). O limite por reserva do formulário público não se aplica.
- **FR-029**: Ao alterar a quantidade, o valor total DEVE ser recalculado com o preço por peça
  original da reserva.
- **FR-030**: Reservas pagas ou canceladas NÃO DEVEM permitir alteração de quantidade.
- **FR-031**: A vendedora DEVE poder cancelar uma reserva ativa, após uma confirmação. Ao
  cancelar, as peças voltam para o estoque disponível, a reserva sai dos totais e continua
  visível como cancelada; o cancelamento é definitivo e a reserva não pode mais ser editada nem
  ter os status alterados.
- **FR-032**: Ao cancelar uma reserva paga, a confirmação DEVE avisar que o valor precisa ser
  devolvido ao cliente.
- **FR-040**: A vendedora DEVE poder corrigir nome, WhatsApp e endereço de uma reserva ativa,
  esteja ela paga ou não, com as mesmas validações do formulário público (FR-005). A correção NÃO
  DEVE alterar código, quantidade, preço, valor total nem status. Reservas canceladas NÃO DEVEM
  permitir correção.

**Painel: preço, estoque e abertura das reservas**

- **FR-033**: A vendedora DEVE poder definir e alterar o preço por peça, em R$ com centavos e
  maior que zero. A mudança vale só para novas reservas.
- **FR-034**: A vendedora DEVE ajustar o estoque informando o total de queijos que tem para
  vender na temporada. As peças disponíveis DEVEM ser sempre calculadas como esse total menos as
  peças em reservas ativas; ela não edita o disponível diretamente.
- **FR-035**: O total de queijos NÃO DEVE ficar abaixo das peças já comprometidas em reservas
  ativas; um ajuste assim DEVE ser recusado com aviso claro, mostrando quantas peças estão
  reservadas, e nada muda.
- **FR-041**: O painel DEVE ter um botão para encerrar e reabrir as reservas, que começam abertas.
  Com as reservas encerradas, a página pública DEVE informar que as reservas estão encerradas e
  NÃO DEVE exibir o formulário nem aceitar reservas, mesmo havendo peças disponíveis; o painel
  continua funcionando normalmente. Quando mais de um aviso se aplica, a página DEVE mostrar só um,
  nesta ordem: "ainda não abriram" (preço não definido), "encerradas", "esgotou".

**Integridade, idioma e uso no celular**

- **FR-036**: O sistema NUNCA DEVE permitir que as reservas ativas somem mais peças do que existem,
  mesmo com acessos simultâneos. Reservar, alterar quantidade e cancelar DEVEM ser operações
  tudo-ou-nada: ou tudo é aplicado, ou nada muda.
- **FR-037**: O preço por peça de uma reserva DEVE ser fixado no momento da criação e NUNCA mudar
  depois, nem quando o preço do produto muda, nem quando a quantidade da reserva é alterada.
- **FR-038**: Toda a interface DEVE estar em português do Brasil, com linguagem simples e sem
  termos técnicos; datas e horas no horário de Brasília; valores em reais no formato brasileiro
  (ex.: R$ 1.234,56).
- **FR-039**: A página pública e o painel DEVEM ser plenamente utilizáveis no celular, inclusive
  abertos a partir do WhatsApp, sem zoom nem rolagem horizontal.

### Key Entities *(include if feature involves data)*

- **Venda (produto único)**: o queijo à venda na temporada. Atributos: nome e descrição exibidos
  na página, preço por peça atual (pode ainda não estar definido), total de queijos e situação
  das reservas (abertas/encerradas). As peças disponíveis são derivadas: total menos as peças em
  reservas ativas.
- **Reserva**: o pedido de um cliente. Atributos: código, nome, WhatsApp, endereço (opcional),
  quantidade, preço por peça fixado na criação, valor total (quantidade × preço fixado), data e
  hora da criação, status de pagamento (pendente/pago), status de entrega (pendente/entregue) e
  situação (ativa/cancelada). As reservas ativas consomem peças do estoque da Venda.
- **Vendedora (administradora)**: a única pessoa com acesso ao painel; vê e altera reservas,
  preço, estoque e abertura das reservas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um cliente consegue, pelo celular, ir da abertura do link ao comprovante em menos de
  2 minutos.
- **SC-002**: Em testes com várias pessoas tentando reservar as últimas peças ao mesmo tempo, o
  total de peças em reservas ativas nunca passa do estoque (0 ocorrências).
- **SC-003**: A vendedora encontra uma reserva pelo código de um comprovante em menos de 15
  segundos depois de abrir o painel.
- **SC-004**: Os totais "Recebido" e "A receber" batem 100% com a soma manual das reservas ativas
  por status de pagamento, em qualquer momento.
- **SC-005**: O comprovante cabe inteiro numa tela de celular de 360×640 sem rolagem.
- **SC-006**: Nenhum conteúdo público (páginas, textos compartilhados, dados acessíveis sem login)
  contém o telefone ou a chave Pix da vendedora (0 ocorrências).
- **SC-007**: Sem login, 0 reservas ou dados de clientes podem ser lidos ou alterados.
- **SC-008**: Depois de uma mudança de preço, 100% das reservas anteriores mantêm o preço por peça
  e o total originais.
- **SC-009**: A vendedora consegue, sem ajuda, marcar pagamento e entrega, buscar por código,
  alterar a quantidade, corrigir dados do cliente, cancelar uma reserva e encerrar ou reabrir as
  reservas na primeira tentativa, usando só o celular.
- **SC-010**: A página pública fica pronta para uso em até 3 segundos numa conexão móvel comum.

## Assumptions

- Os clientes têm WhatsApp com número brasileiro; números de outros países estão fora do escopo.
- O limite de 10 peças por reserva é fixo (decisão de 2026-10-29, revista no planejamento para
  bater com o banco já criado); mudá-lo exige o responsável técnico. Quem quiser mais peças faz outra reserva ou pede à vendedora para ajustar a quantidade.
- O estoque é informado como total de queijos da temporada (decisão de 2026-10-29); o disponível é
  sempre calculado, nunca digitado.
- Nome, descrição e foto (opcional) do produto exibidos na página são definidos na preparação do
  app e não são editados pelo painel; da venda, o painel edita só preço, estoque e abertura das
  reservas.
- O acesso da vendedora é por e-mail e senha. A conta é criada na preparação do app, e a
  recuperação de acesso é feita pelo responsável técnico, fora do app.
- As reservas não expiram sozinhas. Reservas não pagas ou suspeitas são canceladas manualmente
  pela vendedora. Como o link circula entre pessoas próximas, não há proteção extra contra
  reservas falsas além das validações e do limite por reserva (decisão de 2026-10-29): não há
  limite por número de WhatsApp, verificação anti-robô nem coleta de dados como IP. A única
  barreira extra é um campo-armadilha invisível para pessoas (definido no planejamento), que
  descarta envios automáticos sem coletar nenhum dado.
- O comprovante só aparece logo após a reserva. Não há consulta pública posterior; se o cliente o
  perder, a vendedora tem todos os dados no painel.
- O cancelamento é definitivo. Para "desfazer", faz-se uma nova reserva — a vendedora pode usar a
  própria página pública em nome do cliente.
- Voltar o pagamento de "pago" para "pendente" (ex.: marcado por engano) é permitido e volta a
  liberar a alteração de quantidade.
- A disponibilidade mostrada na página pública é a do momento em que ela foi aberta; a
  confirmação sempre usa o valor atual.
- Há uma única temporada de vendas. Não há histórico de temporadas anteriores; a limpeza dos dados
  dos clientes ao fim da temporada é feita fora do app.
- Dependências externas: o WhatsApp instalado no celular (atalho de conversa e envio do
  comprovante) e o recurso de compartilhamento do próprio celular.
- **Fora do escopo**: pagamento online; dados de pagamento na página; múltiplos produtos; conta de
  cliente; cancelamento ou alteração pelo próprio cliente; criação de reservas pelo painel; mais
  de uma pessoa administradora; notificações automáticas; gráficos; exportação de dados.
