# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Clientes:** pessoas próximas da vendedora, de idades variadas, que normalmente já têm o WhatsApp dela. Abrem o link pelo WhatsApp, quase sempre no celular, e querem reservar peças de queijo sem criar conta.
- **Vendedora (administradora):** pessoa não técnica, usuária única do painel. Usa o celular para acompanhar reservas, confirmar pagamentos e entregas e ajustar preço e estoque.

## Product Purpose

Organizar a venda de queijos de fim de ano: um único produto, vendido por peça, com preço fixo. O cliente reserva, recebe um comprovante com código e o envia para a vendedora pelo WhatsApp, que responde com os dados para pagamento. Sucesso é ninguém reservar mais peças do que existem e a vendedora saber, pelo celular, quem reservou, quem pagou e o que falta entregar.

## Positioning

É a venda de uma pessoa conhecida, não uma loja. O cliente já confia em quem vende; a página substitui a troca de mensagens para anotar pedidos, sem pagamento online e sem cadastro.

## Operating Context

- O link circula pelo WhatsApp e abre no navegador do celular, inclusive no navegador interno do app.
- O comprovante sai da página por print, por compartilhamento do celular ou por texto copiado, e chega à vendedora numa conversa do WhatsApp.
- O pagamento é combinado em particular, fora do app.

## Capabilities and Constraints

- Formulário com exatamente quatro campos visíveis: nome, WhatsApp, quantidade e endereço de entrega (opcional).
- Até 10 peças por reserva no formulário público. Reserva é confirmada na hora, com código de 6 caracteres.
- Estados públicos: ainda não abriram, encerradas, esgotou, formulário e comprovante.
- Nenhum telefone, chave Pix ou dado de pagamento da vendedora na parte pública.
- Interface em português do Brasil, com linguagem simples; valores em R$; datas no horário de Brasília.
- Uso de 360 px de largura para cima, com alvos de toque de pelo menos 44 px.
- Fora do escopo: pagamento online, múltiplos produtos, conta de cliente, notificações automáticas, gráficos.
- O produto é o Queijo do Reino (definido pelo responsável em 2026-11-10). Ainda não definidos: nome da venda e origem do queijo.

## Brand Commitments

Nenhuma marca, logotipo ou paleta existente. Por escolha do responsável (2026-11-02), o visual segue o padrão da categoria, executado no nível de acabamento do Stripe Checkout (formulário) e do Linear e da Vercel (painel): simples, sem tema e sem nenhuma referência a fim de ano. Tema claro e escuro automático, seguindo o aparelho de cada pessoa. Substitui a identidade anterior de cartão de Boas Festas.

## Evidence on Hand

Sem fotos reais do queijo por enquanto. Não usar foto de banco de imagens nem ilustração no lugar. Não inventar depoimentos, avaliações, histórico da produção ou qualquer afirmação sobre o queijo.

## Product Principles

1. Reservar deve ser tão simples quanto mandar uma mensagem para alguém conhecido.
2. O preço, as peças disponíveis e o próximo passo ficam sempre claros.
3. O comprovante é o objeto que sai da página: precisa ser legível num print.
4. A confiança vem da pessoa que vende, não de selos ou promessas.

## Accessibility & Inclusion

Clientes de idades variadas: seguir o mínimo da constituição do projeto (toque de 44 px, texto de campo de 16 px, contraste WCAG AA).
