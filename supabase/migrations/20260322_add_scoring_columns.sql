-- Migration: Add scoring columns needed for full recommendation questionnaire (Q4–Q6)
-- Date: 2026-03-22
-- Environment: development only

ALTER TABLE public.trees
  ADD COLUMN IF NOT EXISTS potencial_sombra_1a5 smallint CHECK (potencial_sombra_1a5 BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS contribuicao_biodiversidade_1a5 smallint CHECK (contribuicao_biodiversidade_1a5 BETWEEN 1 AND 5);

-- Seed values from spreadsheet (Aplicativo - draft - oficial.xlsx, rows 38 and 41)
UPDATE public.trees SET potencial_sombra_1a5 = 5, contribuicao_biodiversidade_1a5 = 5 WHERE nome_popular ILIKE '%oiti%';
UPDATE public.trees SET potencial_sombra_1a5 = 3, contribuicao_biodiversidade_1a5 = 3 WHERE nome_popular ILIKE '%resed%';
UPDATE public.trees SET potencial_sombra_1a5 = 4, contribuicao_biodiversidade_1a5 = 5 WHERE nome_popular ILIKE '%pata%';
UPDATE public.trees SET potencial_sombra_1a5 = 4, contribuicao_biodiversidade_1a5 = 4 WHERE nome_popular ILIKE '%escumilha%';
