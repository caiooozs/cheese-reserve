-- =============================================================
-- Funções do app de reserva de queijos
-- Toda operação que mexe no estoque roda aqui, numa única transação.
-- Erros de regra de negócio saem como mensagem (error.message no
-- supabase-js): quantidade_invalida, venda_fechada,
-- estoque_insuficiente, codigo_indisponivel, reserva_nao_encontrada,
-- reserva_cancelada, reserva_paga, nao_autorizado.
-- =============================================================

-- A usuária logada está na lista de admins?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

-- Dados públicos da página de reserva: preço e peças disponíveis.
create or replace function public.obter_vitrine()
returns table (preco_centavos integer, estoque_disponivel integer)
language sql
stable
security definer
set search_path = ''
as $$
  select c.preco_centavos, c.estoque_disponivel
  from public.configuracao c
  where c.id = 1;
$$;

-- Gera um código aleatório de 6 caracteres para o comprovante,
-- com pelo menos uma letra e um número (ex.: K7M2QX).
-- Alfabeto sem 0/O e 1/I, para não confundir na hora de ler ou digitar.
-- 32 símbolos: cada byte aleatório vira um símbolo sem viés.
create or replace function public.gerar_codigo_reserva()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_codigo text;
begin
  loop
    v_bytes := uuid_send(gen_random_uuid());
    v_codigo := '';
    for i in 0..5 loop
      v_codigo := v_codigo || substr(v_alfabeto, (get_byte(v_bytes, i) % 32) + 1, 1);
    end loop;
    exit when v_codigo ~ '[A-Z]' and v_codigo ~ '[0-9]';
  end loop;
  return v_codigo;
end;
$$;

-- Cria uma reserva descontando o estoque de forma atômica.
-- Retorna só o necessário para o comprovante: código, quantidade,
-- total e data. Nenhum dado de contato ou pagamento da administradora.
-- Limite por reserva do formulário público: 10 peças.
create or replace function public.criar_reserva(
  p_nome text,
  p_whatsapp text,
  p_quantidade integer,
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
  v_preco integer;
  v_codigo text;
  v_criada timestamptz;
  v_tentativa integer := 0;
begin
  if p_quantidade is null or p_quantidade < 1 or p_quantidade > v_limite then
    raise exception 'quantidade_invalida';
  end if;

  update public.configuracao c
     set estoque_disponivel = c.estoque_disponivel - p_quantidade
   where c.id = 1
     and c.preco_centavos > 0
     and c.estoque_disponivel >= p_quantidade
  returning c.preco_centavos into v_preco;

  if not found then
    if (select c.preco_centavos from public.configuracao c where c.id = 1) <= 0 then
      raise exception 'venda_fechada';
    end if;
    raise exception 'estoque_insuficiente';
  end if;

  -- Se o código sorteado já existir (raríssimo), sorteia outro.
  loop
    v_tentativa := v_tentativa + 1;
    begin
      insert into public.reservas (codigo, nome, whatsapp, endereco, quantidade, preco_unitario_centavos)
      values (
        public.gerar_codigo_reserva(),
        trim(p_nome),
        regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g'),
        nullif(trim(p_endereco), ''),
        p_quantidade,
        v_preco
      )
      returning codigo, created_at into v_codigo, v_criada;
      exit;
    exception when unique_violation then
      if v_tentativa >= 5 then
        raise exception 'codigo_indisponivel';
      end if;
    end;
  end loop;

  return query select v_codigo, p_quantidade, p_quantidade * v_preco, v_criada;
end;
$$;

-- Altera a quantidade de uma reserva (só admin, só com pagamento pendente).
-- Aumentar desconta a diferença do estoque; diminuir devolve.
-- Sem limite por reserva aqui, só o estoque disponível.
create or replace function public.alterar_quantidade(
  p_reserva_id uuid,
  p_nova_quantidade integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_atual integer;
  v_pagamento text;
  v_cancelada timestamptz;
  v_delta integer;
begin
  if not public.is_admin() then
    raise exception 'nao_autorizado';
  end if;

  if p_nova_quantidade is null or p_nova_quantidade < 1 then
    raise exception 'quantidade_invalida';
  end if;

  select r.quantidade, r.status_pagamento, r.cancelada_em
    into v_atual, v_pagamento, v_cancelada
    from public.reservas r
   where r.id = p_reserva_id
     for update;

  if not found then
    raise exception 'reserva_nao_encontrada';
  end if;
  if v_cancelada is not null then
    raise exception 'reserva_cancelada';
  end if;
  if v_pagamento = 'pago' then
    raise exception 'reserva_paga';
  end if;

  v_delta := p_nova_quantidade - v_atual;

  if v_delta > 0 then
    update public.configuracao c
       set estoque_disponivel = c.estoque_disponivel - v_delta
     where c.id = 1
       and c.estoque_disponivel >= v_delta;
    if not found then
      raise exception 'estoque_insuficiente';
    end if;
  elsif v_delta < 0 then
    update public.configuracao c
       set estoque_disponivel = c.estoque_disponivel + abs(v_delta)
     where c.id = 1;
  end if;

  update public.reservas r
     set quantidade = p_nova_quantidade
   where r.id = p_reserva_id;
end;
$$;

-- Cancela uma reserva (só admin) e devolve as peças ao estoque.
-- Cancelar de novo não faz nada.
create or replace function public.cancelar_reserva(p_reserva_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quantidade integer;
  v_cancelada timestamptz;
begin
  if not public.is_admin() then
    raise exception 'nao_autorizado';
  end if;

  select r.quantidade, r.cancelada_em
    into v_quantidade, v_cancelada
    from public.reservas r
   where r.id = p_reserva_id
     for update;

  if not found then
    raise exception 'reserva_nao_encontrada';
  end if;
  if v_cancelada is not null then
    return;
  end if;

  update public.reservas r
     set cancelada_em = now()
   where r.id = p_reserva_id;

  update public.configuracao c
     set estoque_disponivel = c.estoque_disponivel + v_quantidade
   where c.id = 1;
end;
$$;
