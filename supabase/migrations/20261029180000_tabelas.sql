-- =============================================================
-- Tabelas do app de reserva de queijos
-- Valores em centavos (inteiro). Formatação em R$ só na interface.
-- =============================================================

-- Configuração da venda: uma única linha (id = 1).
create table public.configuracao (
  id smallint primary key default 1 check (id = 1),
  preco_centavos integer not null default 0 check (preco_centavos >= 0),
  estoque_disponivel integer not null default 0 check (estoque_disponivel >= 0)
);

-- Linha única já criada. Preço 0 = vendas ainda não abertas.
insert into public.configuracao (id) values (1);

-- Reservas feitas pelos clientes.
create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  -- Código aleatório do comprovante (ex.: K7M2QX), para conferir no painel.
  -- Gerado por gerar_codigo_reserva(); não revela quantas reservas existem.
  codigo text not null unique check (codigo ~ '^[A-Z0-9]{6}$'),
  nome text not null check (char_length(nome) between 2 and 80),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,11}$'),
  endereco text check (endereco is null or char_length(endereco) between 1 and 200),
  quantidade integer not null check (quantidade > 0),
  -- Preço da peça no momento da reserva. Não muda depois.
  preco_unitario_centavos integer not null check (preco_unitario_centavos > 0),
  valor_total_centavos integer generated always as (quantidade * preco_unitario_centavos) stored,
  status_pagamento text not null default 'pendente'
    check (status_pagamento in ('pendente', 'pago')),
  status_entrega text not null default 'pendente'
    check (status_entrega in ('pendente', 'entregue')),
  cancelada_em timestamptz,
  created_at timestamptz not null default now()
);

create index reservas_created_at_idx on public.reservas (created_at desc);

-- Quem pode acessar o painel. Depois de criar a usuária no Auth:
--   insert into public.admins (user_id) values ('<uuid da usuária>');
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
