---
name: Cheese Reserve
description: Reserva de queijo artesanal no padrão de um checkout bem-feito, com painel sóbrio para a vendedora.
colors:
  background: "oklch(0.985 0 0)"
  foreground: "oklch(0.205 0 0)"
  card: "oklch(1 0 0)"
  primary: "oklch(0.205 0 0)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.96 0 0)"
  muted: "oklch(0.96 0 0)"
  muted-foreground: "oklch(0.46 0 0)"
  accent: "oklch(0.95 0 0)"
  border: "oklch(0.91 0 0)"
  input: "oklch(0.64 0 0)"
  ring: "oklch(0.55 0.19 259)"
  destructive: "oklch(0.53 0.2 27)"
  sucesso: "oklch(0.5 0.13 152)"
  sucesso-fundo: "oklch(0.96 0.04 152)"
  aviso: "oklch(0.5 0.12 65)"
  aviso-fundo: "oklch(0.97 0.05 85)"
  background-escuro: "oklch(0.145 0 0)"
  foreground-escuro: "oklch(0.95 0 0)"
  card-escuro: "oklch(0.185 0 0)"
  primary-escuro: "oklch(0.95 0 0)"
  primary-foreground-escuro: "oklch(0.185 0 0)"
  secondary-escuro: "oklch(0.25 0 0)"
  muted-escuro: "oklch(0.235 0 0)"
  muted-foreground-escuro: "oklch(0.72 0 0)"
  accent-escuro: "oklch(0.26 0 0)"
  border-escuro: "oklch(0.27 0 0)"
  input-escuro: "oklch(0.52 0 0)"
  ring-escuro: "oklch(0.68 0.16 257)"
  destructive-escuro: "oklch(0.7 0.18 24)"
  sucesso-escuro: "oklch(0.76 0.15 152)"
  sucesso-fundo-escuro: "oklch(0.27 0.05 152)"
  aviso-escuro: "oklch(0.82 0.13 80)"
  aviso-fundo-escuro: "oklch(0.28 0.05 75)"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.556
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  nota:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  rotulo-painel:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  codigo:
    fontFamily: "Geist Mono, monospace"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.11
    letterSpacing: "0.14em"
  codigo-busca:
    fontFamily: "Geist Mono, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.12em"
  codigo-linha:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: "0.08em"
rounded:
  campo: "8px"
  cartao: "12px"
  pilula: "9999px"
spacing:
  rotulo: "6px"
  grupo: "12px"
  cartao: "16px"
  campos: "20px"
  cartao-largo: "24px"
  secao: "32px"
  colunas: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.campo}"
    height: "48px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.campo}"
    padding: "0 16px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.campo}"
    padding: "0 12px"
    height: "44px"
  campo:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.campo}"
    padding: "0 14px"
    height: "48px"
  stepper:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.campo}"
    height: "48px"
    width: "160px"
  cartao:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.cartao}"
    padding: "16px"
  cartao-numero:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.headline}"
    rounded: "{rounded.cartao}"
    padding: "14px 16px"
  chip-disponibilidade:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.rotulo-painel}"
    rounded: "{rounded.pilula}"
    padding: "4px 12px"
  chip-poucas-pecas:
    backgroundColor: "{colors.aviso-fundo}"
    textColor: "{colors.aviso}"
    typography: "{typography.rotulo-painel}"
    rounded: "{rounded.pilula}"
    padding: "4px 12px"
  chip-esgotado:
    textColor: "{colors.destructive}"
    typography: "{typography.rotulo-painel}"
    rounded: "{rounded.pilula}"
    padding: "4px 12px"
  aviso:
    backgroundColor: "{colors.aviso-fundo}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.campo}"
    padding: "12px"
  marca-confirmacao:
    backgroundColor: "{colors.sucesso-fundo}"
    textColor: "{colors.sucesso}"
    rounded: "{rounded.pilula}"
    size: "40px"
  linha-reserva:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    padding: "14px 16px"
  interruptor:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.pilula}"
    height: "18.4px"
    width: "32px"
  interruptor-desligado:
    backgroundColor: "{colors.input}"
    rounded: "{rounded.pilula}"
    height: "18.4px"
    width: "32px"
  barra-pecas:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.pilula}"
    height: "6px"
  barra-pecas-preenchida:
    backgroundColor: "{colors.foreground}"
    rounded: "{rounded.pilula}"
    height: "6px"
---

# Design System: Cheese Reserve

## Overview

**Creative North Star: "O Checkout Bem-Feito"**

O sistema é o padrão da categoria executado com acabamento: a página pública se comporta como um checkout no nível do Stripe Checkout, e o painel da vendedora como os painéis do Linear e da Vercel. Não há tema, enfeite nem referência a época do ano. A personalidade está na precisão: uma régua só de cinzas, Geist bem espaçada, campos em caixa grandes, cartões de borda fina e números que se movem quando mudam.

Claro e escuro seguem o aparelho de cada pessoa, sem botão de troca, e o escuro espelha a mesma régua. A cor existe para dizer alguma coisa: azul para o foco, verde para a confirmação, âmbar para aviso, vermelho para erro. O resto é tinta sobre papel neutro, com o botão principal na cor do texto.

O público é qualquer pessoa, de qualquer idade, quase sempre no celular. Por isso a densidade é generosa e os pisos são fixos: toque de 44 px ou mais, texto de campo de 16 px ou mais, contraste AA no texto e bordas de campo com pelo menos 3:1 contra o fundo.

**Key Characteristics:**
- Régua única de cinzas sem croma, espelhada no escuro.
- Claro e escuro automáticos, por `prefers-color-scheme`.
- Geist em todo o texto; Geist Mono só nos códigos de reserva.
- Botão principal na cor do texto: preto no claro, quase branco no escuro.
- Cartões com borda fina, raio de 12 px e sombra xs; campos e botões com 8 px.
- Cor só para estado: azul no foco, verde na confirmação, âmbar no aviso, vermelho no erro.
- Números com algarismos tabulares, que deslizam até o novo valor no painel.

## Colors

Uma régua neutra de croma zero, mais quatro cores com função fixa. Os valores vivem em OKLCH em `app/globals.css`; o escuro troca os mesmos papéis dentro de `@media (prefers-color-scheme: dark)`.

### Primary
- **Tinta** (`primary`, igual ao `foreground`): o botão principal, o texto, os títulos, o interruptor ligado e o preenchimento da barra de peças. No escuro vira quase branco, com o texto do botão em cinza muito escuro (16:1 nos dois temas).

### Secondary
- **Azul de Foco** (`ring`): o único azul do sistema. Anel de foco de 3 px a 50% em campos, botões e interruptores, borda do campo em foco, cor do cursor de texto e a seleção de texto (misturado a 28%). Fica entre 5:1 e 6,4:1 contra o cartão.

### Tertiary
- **Verde de Confirmação** (`sucesso` sobre `sucesso-fundo`): só a marca redonda de "Reserva confirmada" no comprovante.
- **Âmbar de Aviso** (`aviso` sobre `aviso-fundo`): o aviso de preço alterado, o aviso do painel quando a venda foge do normal e o chip de disponibilidade quando restam 3 peças ou menos.
- **Vermelho de Erro** (`destructive`): erros de campo, a borda do campo inválido, o aviso de sessão no login e o chip "Esgotado", este com fundo de vermelho a 5% e borda a 30%.

### Neutral
- **Fundo** (`background`): a página inteira e a cor de tema do navegador (#fafafa no claro, #0a0a0a no escuro).
- **Cartão** (`card`): cartões, campos, o cabeçalho do painel e as linhas da lista. No escuro fica um degrau acima do fundo.
- **Cinza de Apoio** (`muted-foreground`): descrições, ajudas, rótulos dos cartões de número, metadados das linhas e a situação desligada do interruptor. Passa de 6,8:1 nos dois temas.
- **Cinza Apagado** (`muted`, `secondary`, `accent`): o total do pedido no celular, o fundo da barra de peças, o chip de reserva encerrada ou não aberta, o círculo dos ícones de estado, os esqueletos de carregamento e o hover dos botões ghost e de contorno.
- **Fio** (`border`): bordas de cartão, fios entre linhas e dentro das linhas, borda do cabeçalho do painel e a barra de rolagem.
- **Borda de Campo** (`input`): a borda de 1 px de campos, selects e stepper, e o interruptor desligado. Fica em 3,2:1 a 3,6:1 contra fundo e cartão, nos dois temas.

### Named Rules
**A Regra da Régua Única.** Todo neutro sai de uma régua de cinzas com croma 0, espelhada no escuro. Nenhum cinza ganha matiz quente ou frio.

**A Regra da Cor com Função.** Cor nunca é decoração. Verde só confirma, e só no comprovante. Âmbar avisa e marca poucas peças (3 ou menos). Vermelho marca erro e esgotado. No caso normal, o chip de disponibilidade é neutro.

**A Regra dos 3:1.** A borda de todo campo tem pelo menos 3:1 contra o fundo e contra o cartão, nos dois temas, para quem enxerga pouco também achar o campo.

## Typography

**Display Font:** Geist (com sans-serif)
**Body Font:** Geist (com sans-serif)
**Label/Mono Font:** Geist Mono (com monospace), só nos códigos de reserva

**Character:** Uma família só, neutra e precisa, que faz todo o trabalho com peso e tamanho. A mono aparece como sinal de "isto é um código" e mais nada.

### Hierarchy
- **Display** (600, 1.875rem, 1.2, -0.025em; 2.25rem a partir de 768 px): o nome do produto e o preço por peça, este com algarismos tabulares.
- **Headline** (600, 1.5rem, 1.333, -0.025em): "Reserva confirmada", "Entrar no painel", o total do pedido e os valores dos cartões de número, que sobem para 1.875rem a partir de 640 px.
- **Title** (600, 1.125rem, 1.556, -0.025em): "Fazer reserva", "Painel da venda", "Reservas" e o título da lista vazia. Os títulos de aviso ("Esgotou!") sobem para 1.25rem.
- **Body** (400, 1rem, 1.5): texto corrido, o texto digitado nos campos e os dados das linhas. A descrição do produto sobe para 1.125rem a partir de 768 px, com entrelinha de 1.625 e largura de leitura limitada.
- **Label** (500, 1rem, 1.5): rótulos de campo na página pública e no login, sempre visíveis acima da caixa, e o texto dos botões.
- **Nota** (400, 0.875rem, 1.43): ajudas sob o campo, mensagens de erro, metadados das linhas e a contagem de reservas do dia.
- **Rótulo do painel** (500, 0.875rem, 1.43): rótulos da busca e dos filtros, rótulos dos cartões de número, cabeçalho de colunas e o chip de disponibilidade.
- **Código** (mono 600, 2.25rem, 1.11, 0.14em): o código da reserva no comprovante.
- **Código de busca** (mono 400, 1rem, 0.12em, maiúsculas): o que se digita em "Buscar pelo código".
- **Código de linha** (mono 500, 0.875rem, 0.08em): o código em cada linha da lista, na cor do texto, ao lado do resumo em Cinza de Apoio.

### Named Rules
**A Regra do Mono no Código.** Geist Mono aparece só no código da reserva: no comprovante, na linha da lista e no campo de busca. Preço, data, telefone e quantidade ficam em Geist.

**A Regra dos Algarismos Tabulares.** Todo número de preço, total, quantidade, telefone, data ou contagem usa algarismos tabulares, para não dançar quando muda.

**A Regra dos 16 px.** Texto digitado em campo nunca fica abaixo de 16 px, em nenhuma largura. O kit reduz para 14 px no desktop; o sistema desfaz essa redução.

## Layout

A página pública é uma grade de checkout de até 1024 px, com 16 px de margem lateral (24 px a partir de 640 px, 32 px a partir de 768 px). No celular é uma coluna na ordem produto, oferta e formulário. A partir de 768 px vira duas colunas com 64 px entre si: à esquerda o produto e, abaixo, a oferta (preço, chip de disponibilidade, resumo do pedido e "Como funciona"), que fica fixa a 32 px do topo enquanto o formulário rola à direita. O topo tem 32 px no celular e 80 px no desktop.

No formulário, rótulo e campo ficam a 6 px, campos a 20 px entre si, e o cartão tem 16 px de margem interna (24 px a partir de 640 px). No celular, o total do pedido aparece dentro do formulário, logo acima do botão; no desktop ele vive no resumo à esquerda.

O comprovante cobre a tela inteira numa coluna de até 448 px, centrada na vertical, para o print pegar só ele. O login é uma coluna de até 384 px, também centrada.

O painel tem um cabeçalho de 64 px em cartão com fio inferior e o conteúdo na mesma largura de 1024 px. Os cartões de número ficam em duas colunas no celular (Recebido e A receber lado a lado, Peças na largura toda) e em três a partir de 768 px, a 12 px entre si. Abaixo vêm "Reservas", a busca com filtros e a lista, agrupada por dia, com 20 px entre os dias. No celular os filtros abrem por um botão; no desktop ficam na mesma linha da busca. A partir de 768 px a lista ganha cabeçalho de colunas e cada reserva vira uma linha só, nas colunas reserva, total (8rem), pagamento (9rem), entrega (10rem) e detalhes (2.75rem).

**A Regra do Checkout.** No desktop, produto e resumo do pedido ficam à esquerda e o formulário à direita; no celular, tudo numa coluna, com o formulário logo depois do preço.

**A Regra dos 44 px.** Todo alvo de toque tem pelo menos 44 px: campos, stepper e botões principais com 48 px, botões ghost, gatilho de detalhes e interruptores no desktop com 44 px, e interruptores no celular com 48 px.

## Elevation & Depth

O sistema é quase plano. A profundidade vem da diferença entre Fundo e Cartão e do fio fino de borda; a sombra é só um acabamento, a menor da escala, igual em tudo que a usa. Nada se eleva no hover.

### Shadow Vocabulary
- **Sombra xs** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): cartões, campos, selects, stepper e botões de contorno.
- **Anel de foco** (`box-shadow: 0 0 0 3px` no Azul de Foco a 50%): foco visível de campos, botões, stepper e interruptores, junto com a borda em Azul de Foco.

### Named Rules
**A Regra da Sombra Única.** Só existe a sombra xs. Nenhum elemento ganha sombra maior, sombra colorida ou elevação no hover.

## Shapes

Duas medidas de canto e a pílula. O que se aperta ou se preenche tem 8 px: campos, selects, stepper, botões e caixas de aviso. O que contém tem 12 px: cartões do formulário, do resumo, do comprovante, do login, cartões de número e o grupo de linhas de cada dia. Chips, interruptores, a barra de peças e os círculos de ícone são pílulas ou círculos.

As bordas são sempre de 1 px. Dentro de um cartão, as divisões são fios de 1 px em Fio, nunca outro contêiner.

**A Regra dos Dois Raios.** Campo e botão com 8 px, cartão com 12 px, chip e interruptor em pílula. Nada fora dessas três formas.

**A Regra do Cartão Único.** Nada de cartão dentro de cartão. Dentro do comprovante e dentro de uma linha da lista, a separação é por fio fino.

## Components

### Buttons
Grandes, diretos, sem ornamento.
- **Shape:** cantos suaves (8 px).
- **Primary:** fundo na cor do texto e texto no fundo, em Label, com 48 px de altura. No formulário e no login ocupa a largura toda.
- **Hover / Focus:** o fundo clareia para 80%, o foco ganha a borda e o anel em Azul de Foco, e ao pressionar desce 1 px. Desabilitado fica a 50% de opacidade.
- **Contorno:** fundo de página, borda em Fio (Borda de Campo no escuro), sombra xs e 48 px; usado em Buscar, Filtros, Copiar e no atalho do WhatsApp (44 px).
- **Ghost:** sem fundo, 44 px; usado em Sair, Limpar filtros, mostrar ou esconder a senha e no gatilho de detalhes da linha.
- **Enviando:** spinner antes do rótulo e o texto "Reservando…" ou "Entrando…".
- **Link:** "Fazer outra reserva" é texto sublinhado na cor do texto, com 44 px de alvo.

### Chips
- **Style:** pílula com borda de 1 px, 4 px por 12 px de margem, em Rótulo do painel com algarismos tabulares.
- **State:** neutro (Cartão com Cinza de Apoio) quando há peças; âmbar com 3 peças ou menos; vermelho em "Esgotado"; Cinza Apagado quando as reservas não abriram ou encerraram. Na linha cancelada, "Cancelada" é um chip em Cinza Apagado sem borda.

### Cards / Containers
- **Corner Style:** 12 px.
- **Background:** Cartão.
- **Shadow Strategy:** sombra xs (ver Elevation & Depth).
- **Border:** 1 px em Fio.
- **Internal Padding:** 16 px no celular e 24 px a partir de 640 px; cartões de número com 14 px por 16 px; resumo do pedido com 20 px.

### Inputs / Fields
- **Style:** caixa de 48 px em Cartão, borda de 1 px em Borda de Campo, 8 px de canto, 14 px de margem lateral, sombra xs e texto de 16 px. Rótulo sempre visível acima, ajuda abaixo em Nota.
- **Focus:** borda em Azul de Foco com anel de 3 px a 50%; borda e anel mudam em 150 ms.
- **Error:** borda em vermelho com anel de vermelho a 20%, e a mensagem em Nota vermelha abaixo do campo.
- **Stepper de quantidade:** uma caixa só, do tamanho dos botões, com dois botões ghost de 48 px e o número no meio (64 px, 1.125rem em 600), separados por fios. O foco do número acende a caixa inteira.
- **Select:** select nativo com a mesma caixa de 48 px, seta de 20 px à direita.
- **Busca:** a caixa leva a lupa de 20 px à esquerda e o texto em Código de busca.
- **Senha:** a caixa reserva 48 px à direita para o botão ghost de 44 px.

### Navigation
O painel tem só um cabeçalho de 64 px em Cartão com fio inferior: "Painel da venda" em Title, o nome do produto em Nota abaixo e o botão ghost Sair à direita. A página pública não tem navegação.

### Resumo do pedido
O cartão fixo da coluna esquerda no desktop: "Resumo do pedido" em 1rem 600, o produto com a conta ("2 peças × R$ 50,00") em Nota, um fio e o Total em Headline. No celular o mesmo total aparece num bloco de Cinza Apagado acima do botão Reservar.
- **Interação assinatura:** o resumo acompanha a quantidade na hora; cada toque no stepper atualiza a conta e o total.

### Comprovante
Tela cheia sobre o Fundo, com entrada em fade de 200 ms. No topo, a marca de confirmação (círculo de 40 px em Verde de Confirmação) e "Reserva confirmada" em Headline, que recebe o foco. Abaixo, um cartão com "Código da reserva" em Nota, o código em Código e os dados em pares de rótulo e valor separados por fios, com o Total em 1.125rem 600. Fora do cartão, Compartilhar (primário) e Copiar (contorno) lado a lado, a instrução em Cinza de Apoio e o link "Fazer outra reserva".

### Cartões de número
Rótulo em Rótulo do painel e Cinza de Apoio, valor em Headline com algarismos tabulares e uma nota curta ("Já pago", "Falta pagar") no pé. O cartão Peças mostra "29 de 40 reservadas", uma barra de 6 px em pílula (Cinza Apagado com preenchimento na cor do texto) e as peças disponíveis.
- **Interação assinatura:** quando um valor muda, Recebido e A receber contam do antigo ao novo em 500 ms, com curva quártica, e a barra desliza até a nova fração em 500 ms com `cubic-bezier(0.16, 1, 0.3, 1)`.

### Lista de reservas
Um cartão por dia, com o cabeçalho do dia ("Hoje", "Ontem", "30 de outubro") em 1rem 600 e a contagem em Nota fora do cartão, e as reservas separadas por fio.
- **Linha no celular:** nome em 1rem 600 e total à direita; abaixo, o código em Código de linha e o resumo; abaixo de um fio, Pago e Entregue em duas metades separadas por fio vertical, cada uma com 48 px.
- **Linha no desktop:** uma linha só nas colunas do cabeçalho, com os interruptores em 44 px.
- **Detalhes:** o gatilho ghost de 44 px abre, abaixo de um fio, WhatsApp, entrega e hora em pares de rótulo e valor, e o botão de contorno "Abrir conversa no WhatsApp". A altura anima em 200 ms `ease-out`.
- **Cancelada:** a linha passa a Cinza de Apoio e os interruptores dão lugar ao chip "Cancelada" e a "Fora dos totais".
- **Vazia:** o mesmo cartão com o ícone num círculo de Cinza Apagado, título em Title e a explicação em Cinza de Apoio.

### Interruptor
A chave do kit (32 px por 18,4 px, em pílula, ligada na cor do texto e desligada em Borda de Campo) dentro de um rótulo que é o alvo de toque inteiro. No celular o rótulo diz o que a chave controla ("Pago", "Entregue"). No desktop, onde o cabeçalho da coluna já diz isso, o texto ao lado mostra a situação: "Pago" ou "Pendente", "Entregue" ou "A entregar", com a situação desligada em peso normal e Cinza de Apoio.

**A Regra do Nome Constante.** O nome acessível do interruptor é sempre o que ele controla ("Pago", "Entregue") e nunca muda com o estado; a situação visível no desktop é só visual.

### Aviso
Caixa de 8 px com borda de 1 px, 12 px de margem e ícone de 20 px à esquerda: âmbar para preço alterado e venda fora do normal, vermelho para aviso de sessão no login.

### Movimento
Transições de estado (borda e anel de campo, botões, chevron, entrada do comprovante, altura dos detalhes) ficam entre 150 e 200 ms. Só o deslize dos números e da barra leva 500 ms. Com `prefers-reduced-motion`, nada se move: os números pulam direto para o valor final, a barra e os detalhes mudam sem transição e o comprovante aparece parado.

## Do's and Don'ts

### Do:
- **Do** tirar todo neutro da régua única de cinzas sem croma, e espelhar no escuro.
- **Do** seguir o tema do aparelho, claro ou escuro, sem botão de troca.
- **Do** usar o botão principal na cor do texto, com 48 px de altura.
- **Do** desenhar campos como caixas de 48 px, borda de 1 px com pelo menos 3:1, texto de 16 px e rótulo sempre visível.
- **Do** manter todo alvo de toque com pelo menos 44 px.
- **Do** usar cartões com borda de 1 px, raio de 12 px e sombra xs, e 8 px em campos e botões.
- **Do** separar o conteúdo dentro de um cartão por fio fino.
- **Do** escrever todo número com algarismos tabulares.
- **Do** mostrar no desktop a situação ao lado do interruptor ("Pago" ou "Pendente", "Entregue" ou "A entregar"), mantendo o nome acessível constante.
- **Do** fazer o resumo do pedido acompanhar a quantidade e os números dos cartões deslizarem até o novo valor em 500 ms.
- **Do** manter as transições de estado entre 150 e 200 ms e parar todo movimento com `prefers-reduced-motion`.

### Don't:
- **Don't** usar tema, enfeite ou qualquer referência a datas do ano.
- **Don't** usar foto de banco de imagens nem ilustração no lugar da foto do queijo.
- **Don't** usar verde fora da confirmação do comprovante, nem dar cor ao chip de disponibilidade no caso normal.
- **Don't** usar Geist Mono fora dos códigos de reserva.
- **Don't** colocar cartão dentro de cartão.
- **Don't** colocar kicker ou eyebrow acima de títulos.
- **Don't** usar sombra maior que xs nem elevar elementos no hover.
- **Don't** baixar o texto de campo para menos de 16 px, nem no desktop.
- **Don't** trocar o nome acessível do interruptor conforme o estado.
