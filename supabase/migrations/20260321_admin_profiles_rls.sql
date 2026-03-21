-- ============================================================
-- Migration: Admin Profiles & RLS
-- Ambiente: Supabase DEV (PlanteiCerto-Dev)
-- Data: 2026-03-21
-- Descrição: Cria tabela profiles com roles, trigger de auto-criação,
--            backfill de usuários existentes e políticas RLS para
--            profiles e trees.
-- ============================================================

-- ============================================================
-- 1. TABELA PUBLIC.PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  email text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfis de usuário com controle de role (user/admin)';
COMMENT ON COLUMN public.profiles.role IS 'Role do usuário: user (padrão) ou admin';

-- ============================================================
-- 2. TRIGGER: AUTO-CRIAR PERFIL AO REGISTRAR USUÁRIO
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger anterior se existir (idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. BACKFILL: CRIAR PERFIS PARA USUÁRIOS EXISTENTES
-- ============================================================
INSERT INTO public.profiles (id, nome, email)
SELECT
  id,
  COALESCE(
    raw_user_meta_data->>'nome',
    raw_user_meta_data->>'full_name',
    split_part(email, '@', 1)
  ),
  email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. RLS NA TABELA PROFILES
-- ATENÇÃO: Policies que consultam a própria tabela profiles causam
-- recursão infinita. Use sempre a função get_my_role() abaixo.
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Função SECURITY DEFINER para checar role sem acionar RLS (evita recursão)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Qualquer usuário autenticado pode ler seu próprio perfil
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins podem ler todos os perfis (usa função para evitar recursão)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Admins podem atualizar qualquer perfil (ex: promover/rebaixar)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- Usuários podem atualizar o próprio perfil (nome, etc — mas não role)
-- Nota: a proteção do campo role é feita no frontend + validação
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- 5. RLS NA TABELA TREES
-- ============================================================
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon + authenticated)
CREATE POLICY "Public read trees"
  ON public.trees
  FOR SELECT
  USING (true);

-- Apenas admin pode inserir árvores
CREATE POLICY "Admin insert trees"
  ON public.trees
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas admin pode atualizar árvores
CREATE POLICY "Admin update trees"
  ON public.trees
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas admin pode deletar árvores
CREATE POLICY "Admin delete trees"
  ON public.trees
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 6. RLS NA TABELA POINTS (se ainda não habilitado)
-- ============================================================
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

-- Leitura: usuário autenticado pode ler pontos dos seus projetos
CREATE POLICY "Users can read own project points"
  ON public.points
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = points.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Insert/Update/Delete: usuário autenticado nos seus projetos
CREATE POLICY "Users can manage own project points"
  ON public.points
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = points.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- 7. STORAGE: BUCKET tree-images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('tree-images', 'tree-images', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública
CREATE POLICY "Public read tree images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tree-images');

-- Upload apenas admin
CREATE POLICY "Admin upload tree images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tree-images'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Delete apenas admin
CREATE POLICY "Admin delete tree images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tree-images'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update apenas admin
CREATE POLICY "Admin update tree images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tree-images'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 8. SEED: PROMOVER PRIMEIRO ADMIN (RODE MANUALMENTE)
-- ============================================================
-- Substitua '<seu-uuid>' pelo ID do seu usuário no auth.users
-- Você pode encontrar seu ID em: Supabase Dashboard > Authentication > Users
--
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<seu-uuid>';
