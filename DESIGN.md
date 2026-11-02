---
name: Cheese Reserve
description: Reserva de queijo de fim de ano em forma de cartão de Boas Festas enviado pelo correio.
colors:
  primary: "#14532D"
  primary-foreground: "#FAFDFA"
  selo: "#B91C1C"
  destructive: "#B91C1C"
  ouro: "#D4A017"
  accent: "#F7DB98"
  card: "#FCFEFD"
  background: "#F9FBF9"
  foreground: "#1B211D"
  muted-foreground: "#525B54"
  secondary: "#ECF2ED"
  muted: "#EFF3F0"
  border: "#DADFDB"
  input: "#78847A"
  ring: "#2E7346"
typography:
  saudacao:
    fontFamily: "Grand Hotel, cursive"
    fontSize: "3.5rem"
    fontWeight: 400
    lineHeight: 0.9
  saudacao-assinatura:
    fontFamily: "Grand Hotel, cursive"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.25
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.375
  campo:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
  selo-valor:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
    fontFeature: "\"tnum\""
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.375
  nota:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  codigo:
    fontFamily: "Geist Mono, monospace"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.11
    letterSpacing: "0.12em"
rounded:
  nenhum: "0"
  moldura-selo: "2px"
  folha: "8px"
  botao: "10px"
  margem-papel: "11px"
spacing:
  rotulo: "4px"
  margem-papel: "5px"
  faixa: "7px"
  stepper: "8px"
  pagina: "12px"
  folha: "16px"
  campos: "20px"
  bloco: "24px"
  pagina-larga: "32px"
components:
  folha:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.folha}"
    padding: "16px"
    width: "448px"
  campo-linha:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.campo}"
    rounded: "{rounded.nenhum}"
    padding: "0"
    height: "44px"
  campo-linha-foco:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.nenhum}"
  botao-reservar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.botao}"
    height: "52px"
  botao-sobre-verde:
    backgroundColor: "{colors.card}"
    textColor: "{colors.primary}"
    rounded: "{rounded.botao}"
    height: "48px"
  stepper-botao:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.botao}"
    size: "48px"
  selo:
    backgroundColor: "{colors.selo}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.selo-valor}"
    padding: "8px"
    width: "112px"
  carimbo:
    textColor: "{colors.primary}"
    size: "88px"
---

# Design System: Cheese Reserve

## Overview

**Creative North Star: "O Cartão pelo Correio"**

Tudo aqui é papelaria de fim de ano. Um fundo verde-garrafa cheio faz o papel de mesa, e sobre ele fica uma folha branca de cartão com a faixa diagonal de correio em vermelho e verde. O preço vem num selo picotado, a confirmação vem num carimbo redondo com a data, e os campos são as linhas de endereço de um cartão postal. Quem reserva preenche um cartão e o recebe de volta carimbado, pronto para seguir pelo WhatsApp.

A densidade é a de um cartão lido no celular: uma coluna, texto grande, alvos de toque generosos. A personalidade vem de poucas peças físicas e não de ornamento: faixa, selo, carimbo e saudação manuscrita. Todo o resto é Geist sóbria sobre papel. O mundo recusa a vitrine de loja e o Natal de neve, trenó e gorro. Por decisão do responsável, o tema é só claro, e a paleta verde `#14532D`, vermelho `#B91C1C` e ouro `#D4A017` foi a escolhida por ele na rodada de direção.

**Key Characteristics:**
- Fundo verde-garrafa cheio, com a folha branca por cima.
- Faixa de correio diagonal nos quatro lados da folha.
- Campos como linhas de cartão postal, sem caixa.
- Selo picotado para o preço, carimbo redondo para o estado e a data.
- Saudação em script como única voz display; Geist em todo o resto.
- Tema só claro.

## Colors

Três cores de papelaria natalina sobre papel quase branco com um leve toque de verde. Em `app/globals.css` os valores vivem em OKLCH; os hex abaixo são a forma portátil dos mesmos valores.

### Primary
- **Verde-Garrafa** (#14532D): o fundo da página inteira (inclusive `html` e a cor do tema do navegador), o botão principal, a faixa de correio e a tinta do carimbo. Texto em papel sobre ele tem contraste de 8,9:1.

### Secondary
- **Vermelho-Selo** (#B91C1C): a saudação, o selo, a faixa de correio, o aviso de preço alterado e os estados de erro (`--destructive` usa o mesmo valor). Contraste de 6,4:1 sobre a folha.

### Tertiary
- **Ouro de Detalhe** (#D4A017): somente o fio de 1 px da moldura interna do selo. Com 2,7:1 sobre o vermelho, é ornamento e nunca texto.
- **Ouro Pálido** (#F7DB98): somente a seleção de texto, além do `accent` herdado pelas primitivas do kit.

### Neutral
- **Papel de Cartão** (#FCFEFD): a folha e os botões preenchidos sobre o verde.
- **Papel de Fundo** (#F9FBF9): fundo do `body`, coberto pelo verde na página pública.
- **Tinta de Texto** (#1B211D): texto principal e títulos.
- **Tinta Secundária** (#525B54): descrições, ajudas e rótulos do comprovante. Contraste de 7,0:1 sobre a folha.
- **Papel Sombreado** (#ECF2ED): fundo da linha em foco.
- **Papel Apagado** (#EFF3F0): esqueletos de carregamento e hover dos botões do kit.
- **Fio Claro** (#DADFDB): bordas gerais do kit.
- **Grafite de Linha** (#78847A): as linhas dos campos, o contorno do stepper e o tracejado. Contraste de 3,9:1 sobre a folha.
- **Anel de Foco** (#2E7346): foco visível dos botões.
- **Papel Claro** (#FAFDFA): texto sobre verde e sobre vermelho.

### Named Rules
**A Regra do Tema Claro.** O tema é só claro, por decisão do responsável. O bloco `.dark` em `app/globals.css` é resíduo do kit e não faz parte do sistema.

**A Regra do Ouro Pequeno.** O ouro aparece em fios e detalhes, nunca em superfície, texto ou botão. Sua raridade é o que faz o selo parecer impresso.

## Typography

**Display Font:** Grand Hotel (com cursive)
**Body Font:** Geist (com sans-serif)
**Label/Mono Font:** Geist Mono (com monospace)

**Character:** Um script de cartão de fim de ano, uma voz só, contra uma Geist neutra que resolve todo o trabalho. O contraste entre a saudação e o resto é o que dá calor sem custar legibilidade.

### Hierarchy
- **Saudação** (400, 3.5rem, 0.9): "Boas Festas" em vermelho no topo da folha.
- **Saudação de assinatura** (400, 1.875rem, 1.25): "Boas Festas" alinhado à direita, fechando o comprovante.
- **Headline** (700, 1.5rem, 1.25, -0.025em): nome do produto, "Reserva confirmada" e o valor total.
- **Title** (500, 1.25rem, 1.375): mensagens de estado, como reservas encerradas ou esgotadas.
- **Campo** (400, 1.125rem): texto digitado nas linhas. O número do stepper sobe para 1.25rem em 600.
- **Selo-valor** (700, 1.125rem, 1.25, -0.025em): preço dentro do selo.
- **Body** (400, 1rem, 1.375): descrição, instruções e erros de campo.
- **Label** (500, 1rem, 1.375): rótulos dos campos, sempre visíveis acima da linha.
- **Nota** (400, 0.875rem, 1.5): ajuda sob o campo, rótulo do selo e "Código da reserva".
- **Código** (mono 600, 2.25rem, 1.11, 0.12em): somente o código da reserva.

### Named Rules
**A Regra da Voz Única.** Grand Hotel é só voz display: a saudação, em tamanho de 30 px para cima. Nunca em rótulo, botão, dado ou texto corrido.

**A Regra do Mono no Código.** Geist Mono aparece somente no código da reserva. Datas, valores, telefones e quantidades ficam em Geist com algarismos tabulares.

**A Regra dos Algarismos Alinhados.** Todo número de preço, estoque, telefone, total ou data usa algarismos tabulares.

## Layout

Coluna única centrada, pensada a partir de 360 px. A folha ocupa até 448 px, quase de borda a borda no celular, e centraliza na vertical quando sobra altura. A margem da página é de 12 px, com 32 px em cima e embaixo a partir de 640 px. Não há mudança de composição no desktop: a mesma folha fica sobre mais verde.

Dentro da folha, o miolo tem 16 px de margem lateral. Rótulo e linha ficam a 4 px, campos a 20 px entre si, e o formulário começa 24 px abaixo do cabeçalho. O selo e o carimbo são posicionados de forma absoluta no canto superior direito, e o cabeçalho reserva 112 px à direita para não passar por baixo deles.

Alvos de toque têm pelo menos 44 px: linhas com 44 px, stepper e botões de ação com 48 px, botão Reservar com 52 px.

## Elevation & Depth

O sistema é plano, com uma única sombra. A folha fica sobre a mesa verde como papel solto, e nada mais se eleva: campos, botões, selo e carimbo vivem no plano da folha. A profundidade restante vem da sobreposição física, com o carimbo batido sobre o selo e sua tinta multiplicando o que está embaixo.

### Shadow Vocabulary
- **Papel sobre a mesa** (`box-shadow: 0 14px 32px -14px` com a Tinta de Texto a 60%): só na folha.

### Named Rules
**A Regra do Papel Solto.** Só a folha tem sombra. Dentro dela tudo é impressão, e impressão não projeta sombra. Sobreposições passageiras do kit, como o toast, mantêm a sombra própria.

## Shapes

A forma separa três naturezas. Papel tem canto suave: a folha tem 8 px, dentro de uma margem de papel de 11 px com 5 px de respiro. O que se aperta tem o raio do kit: botões e stepper usam 10 px. O que se preenche à mão não tem raio: campos são linhas, com 0 px.

O briefing desta documentação citava 6 px para a folha, mas o código entrega 8 px, porque `rounded-md` resolve para `calc(var(--radius) * 0.8)`. Este registro segue o que foi construído.

O selo é o único recorte: a máscara radial fura os quatro lados com furos de 3,5 px a cada 11 px, e a moldura interna tem 2 px de raio. O carimbo é o único círculo. Selo e carimbo são as únicas peças fora de esquadro: +2° e -12°.

**A Regra das Três Formas.** Folha com 8 px, botão e stepper com 10 px, campo com 0 px. Nenhum campo ganha caixa, e nenhum botão perde o raio.

## Components

### Buttons
Diretos e grandes, com o raio do kit.
- **Shape:** cantos suaves (10 px).
- **Primary:** Verde-Garrafa com texto em Papel Claro, 1.125rem em 500, altura de 52 px, largura total, sem borda.
- **Hover / Focus:** o verde clareia a 80%, com anel de foco de 3 px no Anel de Foco a 50% e descida de 1 px ao pressionar. Desabilitado fica a 50% de opacidade.
- **Sobre o verde:** o principal inverte para Papel de Cartão com texto verde, e o secundário fica em contorno de Papel Claro a 70%, ambos com 48 px. A ação de menor peso é ghost em Papel Claro, com 44 px.
- **Enviando:** spinner e o rótulo "Reservando…".

### Inputs / Fields
Linhas de endereço de cartão postal.
- **Style:** fundo transparente, sem caixa e sem raio, só um fio inferior de 2 px em Grafite de Linha. Rótulo sempre visível acima, altura de 44 px.
- **Focus:** o fio passa a Verde-Garrafa e a linha ganha fundo de Papel Sombreado, sem anel. O cursor de texto é verde.
- **Error:** rótulo, fio e mensagem ficam em Vermelho-Selo, com a mensagem em 1rem abaixo da linha.
- **Stepper de quantidade:** dois botões de 48 px em contorno Grafite de Linha, com fundo transparente, ladeando uma linha centrada de 64 px por 48 px.

### Cards / Containers
**A folha** é o contêiner do sistema.
- **Corner Style:** 8 px, dentro da margem de papel de 11 px.
- **Background:** Papel de Cartão.
- **Shadow Strategy:** a sombra "Papel sobre a mesa".
- **Border:** a faixa de correio de 7 px.
- **Internal Padding:** 16 px nas laterais.

### Faixa de Correio
Listras a -45° com período de 36 px: 12 px de vermelho, 6 px de papel, 12 px de verde, 6 px de papel, numa borda de 7 px nos quatro lados da folha. É a marca do sistema e pertence à folha, não a outros elementos.

### Selo
Etiqueta de preço picotada, com 112 px de largura e inclinada em +2°. Fundo Vermelho-Selo, moldura interna de 1 px em ouro, valor em Selo-valor e rótulo em Nota, centralizados. Fica no canto superior direito da folha. Carrega o preço unitário no formulário e o total no comprovante.

### Carimbo
Marca redonda em SVG, com anel externo, anel interno, arco de texto com a saudação em Geist maiúscula e uma ou duas linhas centrais, inclinada em -12°.
- **Tinta:** Verde-Garrafa a 85% de opacidade com `mix-blend-mode: multiply`, então escurece o que estiver embaixo em vez de cobrir. É a tinta de todo carimbo do sistema.
- **Tamanho:** 88 px no comprovante, com a data e a hora; 112 px nos avisos, com o estado ("Em breve", "Encerradas", "Esgotou").
- **Movimento:** ao confirmar, bate de 1,6× até 1× com o fade para 85%, em 320 ms com curva `cubic-bezier(0.16, 1, 0.3, 1)` e 420 ms de atraso. Com `prefers-reduced-motion`, aparece parado.

### Comprovante
Tela cheia sobre o verde, para o print pegar só ele. A folha traz selo com o total, carimbo, código da reserva, tracejado, dados em pares de rótulo e valor, e a saudação de assinatura. As ações ficam fora da folha, sobre o verde. Entra com fade de 300 ms.

### Linha Tracejada
Fio superior tracejado de 2 px em Grafite de Linha, separando o que se preenche do que se confere: antes do total no formulário e antes dos dados no comprovante.

### Herança no painel administrativo
O painel ainda não foi construído. Estas regras vêm da página pública e ele as herda:
- **Folha:** conteúdo sobre o fundo verde, na folha com a faixa de correio, reutilizando o componente `Cartao`.
- **Campos:** linhas, nunca caixas, com os mesmos estados de foco e erro.
- **Forma:** folha com 8 px, botões e stepper com o raio do kit, campos sem raio.
- **Tipografia:** saudação em Grand Hotel só como voz display, Geist no resto, mono só no código da reserva.
- **Carimbo:** a mesma tinta verde a 85% em multiply.
- **Tema e paleta:** só claro, com as três cores escolhidas pelo responsável.

O build só prova uma folha por tela. Como organizar várias folhas ou listas longas fica para a decisão do painel.

## Do's and Don'ts

### Do:
- **Do** colocar todo conteúdo sobre a folha, com a faixa de correio, em cima do fundo verde cheio.
- **Do** usar a regra de forma: folha com 8 px, botão e stepper com 10 px, campo com 0 px.
- **Do** manter o rótulo do campo visível e o texto do campo com pelo menos 16 px.
- **Do** manter alvos de toque com pelo menos 44 px.
- **Do** escrever números de preço, estoque, telefone, total e data com algarismos tabulares.
- **Do** carimbar sempre com a tinta verde a 85% em multiply.
- **Do** deixar o carimbo morder a borda do selo sem cobrir o valor: o comprovante precisa ser legível num print.

### Don't:
- **Don't** criar tema escuro: o tema é só claro, por decisão do responsável.
- **Don't** usar foto de banco de imagens nem ilustração no lugar da foto do queijo.
- **Don't** usar neve, trenó, gorro ou a estética de vitrine de loja.
- **Don't** usar Grand Hotel fora da saudação, nem Geist Mono fora do código da reserva.
- **Don't** usar ouro em texto, superfície ou botão.
- **Don't** colocar sombra em peças impressas na folha, como campos, botões, selo e carimbo.
- **Don't** desenhar campos como caixas.
