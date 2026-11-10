---
version: 1
slug: "app-admin-page-tsx"
primary_target: "app/admin/page.tsx"
related_targets: ["app/admin/login/page.tsx","components/resumo-painel/resumo-painel.view.tsx","components/busca-filtros/busca-filtros.view.tsx","components/lista-reservas/lista-reservas.tsx","components/linha-reserva/linha-reserva.view.tsx","components/formulario-login/formulario-login.view.tsx","components/configuracoes-venda/configuracoes-venda.view.tsx","components/dialogo-quantidade/dialogo-quantidade.view.tsx","components/dialogo-dados-cliente/dialogo-dados-cliente.view.tsx","components/dialogo-cancelar/dialogo-cancelar.view.tsx"]
---

# Painel da vendedora

Escopo: rotas `/admin/login` e `/admin`, com login, totais, peças, busca por código, filtros e a lista de reservas com Pago, Entregue e atalho de WhatsApp. Modo: Operate. Quem usa é a vendedora, sozinha, no celular, várias vezes por dia. Espera de 30 a 80 reservas. O uso mais comum é ver como está a venda. Não pode ter letra ou toque pequeno. Tema claro e escuro automático. Configurações de preço, estoque e abertura (Phase 5) ficam numa faixa recolhível entre os cards de números e a lista, escolha do usuário em 2026-11-10: fechada, mostra o estado salvo numa frase; abre sozinha enquanto falta preço ou total; correções e cancelamento (Phase 6) ficam dentro dos detalhes de cada reserva, escolha do usuário em 2026-11-10, e abrem diálogos de confirmação. A identidade anterior (placar e diário no cartão de Boas Festas) foi substituída a pedido do usuário.

## Direction contract

THESIS: O padrão dos painéis bem-feitos, no nível do Linear e da Vercel: cards de números no topo e a lista de reservas logo abaixo, sóbrios, legíveis e rápidos de ler no celular. Recusa o tema e o enfeite.

OWN-WORLD: Os mesmos neutros, tipografia e campos da página pública. Cards de números com rótulo pequeno e valor grande em algarismos tabulares; lista em linhas separadas por fio fino, com cabeçalho de colunas no desktop; chips de situação discretos; interruptores grandes para Pago e Entregue; reserva cancelada em cinza.

STORY: Ela abre o painel e vê em um olhar quanto recebeu, quanto falta e quantas peças sobram. Logo abaixo busca um código ou filtra, marca Pago ou Entregue num toque e abre a reserva para ver WhatsApp e endereço.

FIRST VIEWPORT: Em 360×640: cabeçalho com "Painel" e Sair; dois cards lado a lado, Recebido e A receber; o card de peças com barra fina; a barra de busca e filtros; e o começo da lista. No desktop, três cards numa linha e a lista vira uma grade com colunas.

FORM: O padrão da categoria (canon), escolhido pelo usuário na rodada de direção, com o acabamento do Linear e da Vercel como régua. Chave do sorteio: 451bc8f3. Interação assinatura: ao marcar Pago, os números dos cards deslizam até o novo valor e a barra acompanha.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
