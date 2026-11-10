---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/formulario-reserva/formulario-reserva.view.tsx","components/comprovante/comprovante.view.tsx","components/aviso-venda/aviso-venda.view.tsx"]
---

# Página pública de reserva

Escopo: rota `/`, com formulário, avisos de estado e comprovante. Modo: Operate. Quem chega é uma pessoa conhecida da vendedora, pelo link do WhatsApp, no celular, de qualquer idade, e precisa reservar peças e sair com um comprovante para enviar. Tema claro e escuro automático. Sem foto por enquanto: nada de ilustração nem foto genérica no lugar. A identidade anterior (cartão de Boas Festas) foi substituída a pedido do usuário: era temática, enfeitada e de cores fortes.

## Direction contract

THESIS: O padrão da categoria executado no nível do Stripe Checkout: um formulário de reserva limpo, que qualquer pessoa entende de primeira, sem tema, sem enfeite e sem época do ano. Recusa o cartão temático e qualquer fantasia.

OWN-WORLD: Neutros de uma régua única de cinzas, espelhada no escuro. Geist no texto, Geist Mono só no código da reserva. Campos em caixa de 48 px com borda de 1 px e anel de foco azul; botão principal na cor do texto (preto no claro, branco no escuro); cartões com borda fina e raio de 12 px; verde só para confirmação, âmbar e vermelho só para estados.

STORY: A pessoa vê o produto, o preço e quantas peças restam, preenche quatro campos, confere o total e reserva. Recebe a confirmação com o código e envia pelo WhatsApp.

FIRST VIEWPORT: Em 360×640: nome do produto e descrição curta no topo, a linha com o preço por peça e as peças disponíveis, e o formulário logo abaixo com Nome e WhatsApp visíveis. No desktop, duas colunas como um checkout: produto e resumo do pedido à esquerda, formulário à direita.

FORM: O padrão da categoria (canon), escolhido pelo usuário na rodada de direção, com o acabamento do Stripe Checkout e do Linear e da Vercel como régua. Chave do sorteio: 451bc8f3. Interação assinatura: o resumo do pedido acompanha a quantidade na hora, e a confirmação entra com o código em destaque.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
