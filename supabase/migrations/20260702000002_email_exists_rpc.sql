-- Lookup direto de email em auth.users para a edge function check-email-exists.
-- Substitui o uso de auth.admin.listUsers({ perPage: 1000 }), que deixa de
-- enxergar usuários além da primeira página.
-- Execução restrita ao service_role: o client (anon) nunca chama isto direto.

create or replace function public.email_exists(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(p_email))
  );
$$;

revoke execute on function public.email_exists(text) from public, anon, authenticated;
grant execute on function public.email_exists(text) to service_role;
