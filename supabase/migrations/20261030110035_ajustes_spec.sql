-- =============================================================
-- Ajustes da spec 001 sobre o banco já criado
-- - Estoque informado como total de queijos: só muda por função.
-- - Botão de abrir/encerrar as reservas.
-- - Admin corrige nome, WhatsApp e endereço de reservas ativas.
-- - criar_reserva confere o preço que o cliente viu e não duplica
--   o mesmo envio (toque duplo, conexão instável).
-- - Peças reservadas nos totais do painel.
-- Novos erros: reservas_encerradas, preco_alterado, dados_invalidos,
-- estoque_abaixo_do_reservado.
-- =============================================================

-- Tabelas ------------------------------------------------------
alter table public.configuracao
  add column reservas_abertas boolean not null default true;

-- Identifica um envio do formulário; repetir o mesmo envio devolve a mesma reserva.
alter table public.reservas
  add column chave_envio uuid;

create unique index reservas_chave_envio_idx
  on public.reservas (chave_envio)
  where chave_envio is not null;

-- Vitrine pública: também diz se as reservas estão abertas -------
drop function public.obter_vitrine();

create function public.obter_vitrine()
returns table (preco_centavos integer, estoque_disponivel integer, reservas_abertas boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select c.preco_centavos, c.estoque_disponivel, c.reservas_abertas
  from public.configuracao c
  where c.id = 1;
$$;

-- Cria uma reserva ----------------------------------------------
-- A linha de configuração fica travada do começo ao fim: reservas,
-- ajustes de estoque e mudanças de preço passam em fila.
-- Endereço por último, com padrão, para poder ser omitido na chamada.
drop function public.criar_reserva(text, text, integer, text);

create function public.criar_reserva(
  p_nome text,
  p_whatsapp text,
  p_quantidade integer,
  p_preco_esperado_centavos integer,
  p_chave_envio uuid,
  p_endereco text default null
)
returns table (
  codigo text,
  quantidade integer,
  valor_total_centavos integer,
  criada_em timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_limite constant integer := 10;
  v_config public.configuracao%rowtype;
  v_nome text := btrim(p_nome);
  v_whatsapp text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
  v_endereco text := nullif(btrim(p_endereco), '');
  v_codigo text;
  v_criada timestamptz;
  v_tentativa integer := 0;
begin
  select * into v_config
    from public.configuracao c
   where c.id = 1
     for update;

  -- Repetição de um envio que já deu certo: devolve a mesma reserva, sem efeito.
  if p_chave_envio is not null then
    return query
      select r.codigo, r.quantidade, r.valor_total_centavos, r.created_at
        from public.reservas r
       where r.chave_envio = p_chave_envio;
    if found then
      return;
    end if;
  end if;

  if p_quantidade is null or p_quantidade < 1 or p_quantidade > v_limite then
    raise exception 'quantidade_invalida';
  end if;
  if v_config.preco_centavos <= 0 then
    raise exception 'venda_fechada';
  end if;
  if not v_config.reservas_abertas then
    raise exception 'reservas_encerradas';
  end if;
  if p_preco_esperado_centavos is distinct from v_config.preco_centavos then
    raise exception 'preco_alterado';
  end if;
  if v_config.estoque_disponivel < p_quantidade then
    raise exception 'estoque_insuficiente';
  end if;
  if v_nome is null
     or char_length(v_nome) not between 2 and 80
     or v_whatsapp !~ '^[0-9]{10,11}$'
     or char_length(v_endereco) > 200 then
    raise exception 'dados_invalidos';
  end if;

  update public.configuracao c
     set estoque_disponivel = c.estoque_disponivel - p_quantidade
   where c.id = 1;

  -- Se o código sorteado já existir (raríssimo), sorteia outro.
  loop
    v_tentativa := v_tentativa + 1;
    begin
      insert into public.reservas
        (codigo, nome, whatsapp, endereco, quantidade, preco_unitario_centavos, chave_envio)
      values (
        public.gerar_codigo_reserva(),
        v_nome,
        v_whatsapp,
        v_endereco,
        p_quantidade,
        v_config.preco_centavos,
        p_chave_envio
      )
      returning codigo, created_at into v_codigo, v_criada;
      exit;
    exception when unique_violation then
      if v_tentativa >= 5 then
        raise exception 'codigo_indisponivel';
      end if;
    end;
  end loop;

  return query select v_codigo, p_quantidade, p_quantidade * v_config.preco_centavos, v_criada;
end;
$$;

-- Define o total de queijos da temporada (só admin) ----------------
-- O disponível é sempre total menos as peças em reservas ativas, e o
-- total não pode ficar abaixo do que já está reservado.
create function public.definir_estoque_total(p_total integer)
returns table (estoque_disponivel integer, pecas_reservadas integer)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_reservadas integer;
begin
  if not public.is_admin() then
    raise exception 'nao_autorizado';
  end if;

  if p_total is null or p_total < 0 then
    raise exception 'quantidade_invalida';
  end if;

  -- Trava antes de somar: a soma enxerga tudo o que terminou antes da trava.
  perform 1
     from public.configuracao c
    where c.id = 1
      for update;

  select coalesce(sum(r.quantidade), 0)::integer
    into v_reservadas
    from public.reservas r
   where r.cancelada_em is null;

  if p_total < v_reservadas then
    raise exception 'estoque_abaixo_do_reservado';
  end if;

  update public.configuracao c
     set estoque_disponivel = p_total - v_reservadas
   where c.id = 1;

  return query select p_total - v_reservadas, v_reservadas;
end;
$$;

-- Totais do painel: acrescenta as peças reservadas ------------------
create or replace view public.totais_venda
with (security_invoker = true)
as
select
  coalesce(sum(r.valor_total_centavos) filter (where r.status_pagamento = 'pago'), 0)::bigint
    as recebido_centavos,
  coalesce(sum(r.valor_total_centavos) filter (where r.status_pagamento = 'pendente'), 0)::bigint
    as a_receber_centavos,
  coalesce(sum(r.quantidade), 0)::bigint
    as pecas_reservadas
from public.reservas r
where r.cancelada_em is null;

-- Permissões de tabela -------------------------------------------
-- Estoque só muda pelas funções; a admin edita preço e abertura.
revoke update on table public.configuracao from authenticated;
grant update (preco_centavos, reservas_abertas)
  on table public.configuracao to authenticated;

-- Status e dados do cliente; quantidade, cancelamento e código só pelas funções.
revoke update on table public.reservas from authenticated;
grant update (status_pagamento, status_entrega, nome, whatsapp, endereco)
  on table public.reservas to authenticated;

-- Permissões de funções ----------------------------------------
revoke execute on function
  public.obter_vitrine(),
  public.criar_reserva(text, text, integer, integer, uuid, text),
  public.definir_estoque_total(integer)
  from public, anon, authenticated;

grant execute on function
  public.obter_vitrine(),
  public.criar_reserva(text, text, integer, integer, uuid, text)
  to anon, authenticated;

grant execute on function
  public.definir_estoque_total(integer)
  to authenticated;
