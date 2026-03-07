-- ============================================
-- PlanteiCerto — Schema do Banco de Dados
-- Execute este SQL no painel do Supabase (SQL Editor)
-- ============================================

create extension if not exists "uuid-ossp";

-- ============================================
-- TABELA: trees (Catálogo de árvores)
-- ============================================
create table public.trees (
  id              serial primary key,
  nome_popular    text not null,
  nome_cientifico text not null,
  imagem          text not null,
  descricao       text not null,
  altura          text not null,
  raiz            text not null,
  espacamento     text not null,
  compat_nota     smallint not null check (compat_nota between 1 and 5),
  compat_legenda  text not null,
  compat_sub      text[] not null default '{}',
  limpeza_nota    smallint not null check (limpeza_nota between 1 and 5),
  limpeza_legenda text not null,
  limpeza_sub     text[] not null default '{}',
  clima_nota      smallint not null check (clima_nota between 1 and 5),
  clima_legenda   text not null,
  clima_sub       text[] not null default '{}',
  created_at      timestamptz not null default now()
);

alter table public.trees enable row level security;
create policy "Trees are publicly readable" on public.trees for select using (true);

-- ============================================
-- TABELA: projects (Projetos do usuário)
-- ============================================
create table public.projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  nome        text not null,
  descricao   text not null default '',
  centro_lat  double precision not null default -21.1767,
  centro_lng  double precision not null default -47.8208,
  centro_zoom smallint not null default 14,
  created_at  timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can create own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);
create index idx_projects_user_id on public.projects(user_id);

-- ============================================
-- TABELA: points (Pontos de plantio)
-- ============================================
create table public.points (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  tree_id     integer not null references public.trees(id),
  lat         double precision not null,
  lng         double precision not null,
  observacao  text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.points enable row level security;
create policy "Users can view points of own projects" on public.points for select
  using (exists (select 1 from public.projects where projects.id = points.project_id and projects.user_id = auth.uid()));
create policy "Users can add points to own projects" on public.points for insert
  with check (exists (select 1 from public.projects where projects.id = points.project_id and projects.user_id = auth.uid()));
create policy "Users can delete points from own projects" on public.points for delete
  using (exists (select 1 from public.projects where projects.id = points.project_id and projects.user_id = auth.uid()));
create index idx_points_project_id on public.points(project_id);
