-- Migration: Flatten tree data structure (Development Only)
-- Date: 2026-03-17
-- WARNING: This migration destroys all existing tree data and points.
-- Use ONLY in development environment!

-- Drop dependent table first
DROP TABLE IF EXISTS public.points CASCADE;

-- Drop the old nested tree table
DROP TABLE IF EXISTS public.trees CASCADE;

-- Create new flat trees table
CREATE TABLE public.trees (
  id                                  serial PRIMARY KEY,
  foto                                text,
  nome_cientifico                     text NOT NULL,
  nome_popular                        text NOT NULL,
  origem                              text NOT NULL CHECK (origem IN ('Nativa BR', 'Exótica')),
  decidua_perenifolia                 text CHECK (decidua_perenifolia IN ('Perenifólia', 'Decídua', 'Semidecídua')),
  epoca_floracao                      text,
  epoca_frutificacao                  text,
  altura_adulta_max_m                 numeric,
  porte_altura_classe                 text CHECK (porte_altura_classe IN ('Grande', 'Médio', 'Pequeno')),
  diametro_copa_adulto_max_m          numeric,
  copa_classe                         text CHECK (copa_classe IN ('Grande', 'Média', 'Pequena')),
  dap_adulto_max_cm                   numeric,
  altura_primeira_bifurcacao_m        text,
  forma_copa                          text,
  faixa_serv_min_m_recomendada        numeric,
  berco_area_min_m2_recomendada       numeric,
  volume_solo_min_m3_recomendado      numeric,
  compat_fiacao                       text CHECK (compat_fiacao IN ('N', 'A', 'C')),
  potencial_dano_calcada_1a5          smallint CHECK (potencial_dano_calcada_1a5 BETWEEN 1 AND 5),
  tolerancia_sol_pleno                boolean,
  tolerancia_meia_sombra              boolean,
  tolerancia_sombra                   boolean,
  tolerancia_seca_1a5                 smallint CHECK (tolerancia_seca_1a5 BETWEEN 1 AND 5),
  tolerancia_encharcamento_1a5        smallint CHECK (tolerancia_encharcamento_1a5 BETWEEN 1 AND 5),
  tolerancia_poluicao_atmosferica_1a5 smallint CHECK (tolerancia_poluicao_atmosferica_1a5 BETWEEN 1 AND 5),
  tolerancia_compactacao_solo_1a5     smallint CHECK (tolerancia_compactacao_solo_1a5 BETWEEN 1 AND 5),
  tolerancia_ventos_fortes_1a5        smallint CHECK (tolerancia_ventos_fortes_1a5 BETWEEN 1 AND 5),
  potencial_sujeira_1a5               smallint CHECK (potencial_sujeira_1a5 BETWEEN 1 AND 5),
  presenca_espinhos                   boolean
);

-- Create points table (tree plantings within projects)
CREATE TABLE public.points (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tree_id     integer REFERENCES public.trees(id) ON DELETE SET NULL,
  lat         double precision NOT NULL,
  lng         double precision NOT NULL,
  observacao  text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- Seed the 4 sample trees from xlsx
INSERT INTO public.trees (
  id, foto, nome_cientifico, nome_popular, origem, decidua_perenifolia,
  epoca_floracao, epoca_frutificacao, altura_adulta_max_m, porte_altura_classe,
  diametro_copa_adulto_max_m, copa_classe, dap_adulto_max_cm, altura_primeira_bifurcacao_m,
  forma_copa, faixa_serv_min_m_recomendada, berco_area_min_m2_recomendada,
  volume_solo_min_m3_recomendado, compat_fiacao, potencial_dano_calcada_1a5,
  tolerancia_sol_pleno, tolerancia_meia_sombra, tolerancia_sombra,
  tolerancia_seca_1a5, tolerancia_encharcamento_1a5, tolerancia_poluicao_atmosferica_1a5,
  tolerancia_compactacao_solo_1a5, tolerancia_ventos_fortes_1a5, potencial_sujeira_1a5,
  presenca_espinhos
)
VALUES
  (1, 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?auto=format&fit=crop&q=80&w=800',
   'Licania tomentosa', 'Oiti', 'Nativa BR', 'Perenifólia',
   'Set-Nov', 'Dez-Mar', 15, 'Grande', 12, 'Grande', 80, '2,5 - 3,5',
   'Arredondada/Espalhada', 1.80, 2.00, 4.00, 'N', 4,
   true, true, false, 5, 2, 4, 3, 4, 4, false),

  (2, 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=800',
   'Lagerstroemia indica', 'Resedá', 'Exótica', 'Decídua',
   'Verão', NULL, 8, 'Médio', 5, 'Pequena', 30, '1,8 - 2,5',
   'Arredondada/Globosa', 0.80, 1.00, 1.50, 'A', 1,
   true, true, false, 5, 3, 4, 4, 3, 1, false),

  (3, 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Quaresmeirasbicolores.jpg',
   'Bauhinia forficata', 'Pata-de-Vaca', 'Nativa BR', 'Semidecídua',
   'Ago-Nov', 'Dez-Mar', 10, 'Médio', 7, 'Média', 40, '1,8 - 2,5',
   'Arredondada/Irregular', 1.00, 1.50, 2.50, 'C', 3,
   true, true, false, 4, 2, 3, 3, 3, 3, true),

  (4, 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800',
   'Sapindus saponaria', 'Escumilha', 'Nativa BR', 'Decídua',
   'Set-Nov', 'Dez-Mar', 12, 'Médio', 8, 'Média', 50, '2,0 - 3,0',
   'Arredondada/Globosa', 1.20, 1.50, 3.00, 'C', 2,
   true, true, false, 5, 3, 4, 4, 4, 2, false);

-- Create indexes for performance
CREATE INDEX idx_trees_origem ON public.trees(origem);
CREATE INDEX idx_trees_nome_popular ON public.trees(nome_popular);
CREATE INDEX idx_points_project_id ON public.points(project_id);
CREATE INDEX idx_points_tree_id ON public.points(tree_id);
