-- Objetos que vivem nos schemas gerenciados (auth/storage) e não entram no
-- pg_dump do schema public. Extraídos de prod (pg_trigger, storage.buckets,
-- pg_policies) em 2026-07-02 — espelho fiel do estado de produção.

-- Trigger de criação de perfil no signup (função definida no baseline)
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Buckets (todos públicos em prod; criterios/guias foram criados via dashboard)
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('criterios', 'criterios', true),
  ('guias', 'guias', true),
  ('tree-images', 'tree-images', true)
on conflict (id) do nothing;

-- Policies de storage.objects

-- tree-images: leitura pública, escrita só admin
create policy "Public read tree images" on storage.objects
  for select using (bucket_id = 'tree-images');

create policy "Admin upload tree images" on storage.objects
  for insert with check (
    bucket_id = 'tree-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admin update tree images" on storage.objects
  for update using (
    bucket_id = 'tree-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admin delete tree images" on storage.objects
  for delete using (
    bucket_id = 'tree-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- avatars: leitura pública, escrita por autenticados
create policy "public_avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "insert_avatars" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');

create policy "update_avatars" on storage.objects
  for update to authenticated using (bucket_id = 'avatars');

create policy "delete_avatars" on storage.objects
  for delete to authenticated using (bucket_id = 'avatars');

-- guias: leitura pública
create policy "Public Read Guias" on storage.objects
  for select using (bucket_id = 'guias');

-- ATENÇÃO: policy existente em prod que permite INSERT público (sem auth) no
-- bucket guias. Reproduzida para manter paridade, mas deve ser restringida —
-- ver tarefa de segurança da migração.
create policy "Temp Public Insert Guias" on storage.objects
  for insert with check (bucket_id = 'guias');
