-- =============================================================
-- Dados só do banco local (supabase db reset). Não vai para o remoto.
-- =============================================================

-- Venda aberta: R$ 50,00 por peça e 20 peças.
update public.configuracao
   set preco_centavos = 5000,
       estoque_disponivel = 20,
       reservas_abertas = true
 where id = 1;

-- Usuários de teste (senha: senha-teste-123):
-- admin@teste.local tem acesso ao painel; comum@teste.local não tem.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a1',
    'authenticated', 'authenticated', 'admin@teste.local',
    extensions.crypt('senha-teste-123', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000b2',
    'authenticated', 'authenticated', 'comum@teste.local',
    extensions.crypt('senha-teste-123', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  );

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
from auth.users u
where u.id in ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2');

insert into public.admins (user_id)
values ('00000000-0000-0000-0000-0000000000a1');
