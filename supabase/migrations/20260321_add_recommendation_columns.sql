-- Migration: Add columns needed by the recommendation questionnaire
-- Date: 2026-03-21

ALTER TABLE public.trees
  ADD COLUMN IF NOT EXISTS presenca_subst_irritantes boolean,
  ADD COLUMN IF NOT EXISTS atracao_fauna_1a5 smallint CHECK (atracao_fauna_1a5 BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS tolerancia_poda_1a5 smallint CHECK (tolerancia_poda_1a5 BETWEEN 1 AND 5);
