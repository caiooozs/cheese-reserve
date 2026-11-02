-- =============================================================
-- RLS, totais e permissões
-- Público (anon): só obter_vitrine() e criar_reserva().
-- Admin (logada e na tabela admins): lê tudo, edita configuração,
-- marca pago/entregue e usa as funções de alterar e cancelar.
-- Quantidade e cancelamento só mudam pelas funções, para o estoque
-- nunca ficar dessincronizado.
-- =============================================================

alter table public.configuracao enable row level security;
alter table public.reservas enable row level security;
alter table public.admins enable row level security;
-- admins fica sem policies: ninguém lê nem escreve pela API.
-- Só is_admin() (security definer) consulta essa tabela.

-- configuracao ------------------------------------------------
create policy "admin lê a configuração"
  on public.configuracao for select
  to authenticated
  using ((select public.is_admin()));

create policy "admin edita a configuração"
  on public.configuracao for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- reservas ----------------------------------------------------
create policy "admin lê as reservas"
  on public.reservas for select
  to authenticated
  using ((select public.is_admin()));

-- Reserva cancelada fica só para consulta.
create policy "admin atualiza status de reservas ativas"
  on public.reservas for update
  to authenticated
  using ((select public.is_admin()) and cancelada_em is null)
  with check ((select public.is_admin()));

-- Totais do painel (canceladas ficam de fora) ------------------
create view public.totais_venda
with (security_invoker = true)
as
select
  coalesce(sum(r.valor_total_centavos) filter (where r.status_pagamento = 'pago'), 0)::bigint
    as recebido_centavos,
  coalesce(sum(r.valor_total_centavos) filter (where r.status_pagamento = 'pendente'), 0)::bigint
    as a_receber_centavos
from public.reservas r
where r.cancelada_em is null;

-- Permissões de tabela (por coluna onde importa) ---------------
revoke all on table public.configuracao, public.reservas, public.admins, public.totais_venda
  from anon, authenticated;

grant select on table public.configuracao, public.reservas, public.totais_venda
  to authenticated;

grant update (preco_centavos, estoque_disponivel)
  on table public.configuracao to authenticated;

grant update (status_pagamento, status_entrega)
  on table public.reservas to authenticated;

-- Permissões de funções ----------------------------------------
revoke execute on function
  public.is_admin(),
  public.obter_vitrine(),
  public.gerar_codigo_reserva(),
  public.criar_reserva(text, text, integer, text),
  public.alterar_quantidade(uuid, integer),
  public.cancelar_reserva(uuid)
  from public, anon, authenticated;
-- gerar_codigo_reserva() fica sem grant: só criar_reserva usa.

grant execute on function
  public.obter_vitrine(),
  public.criar_reserva(text, text, integer, text)
  to anon, authenticated;

grant execute on function
  public.is_admin(),
  public.alterar_quantidade(uuid, integer),
  public.cancelar_reserva(uuid)
  to authenticated;
