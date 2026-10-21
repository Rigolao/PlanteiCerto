-- Colunas numéricas de DAP e altura projetados aos 20 e 30 anos.
--
-- Em produção, estas colunas foram criadas em 03/10/2026 pelo snippet
-- supabase/snippets/trees-catalog-import-20261003/03-projecoes-20-30-arvores-supabase.sql,
-- que também carregou os valores. Esta migration traz só o esquema para o
-- repositório, para que bancos locais tenham as mesmas 63 colunas de produção.
-- Os valores continuam vindo da carga (snippet), não desta migration.
--
-- Idempotente: em produção não altera nada (ADD COLUMN IF NOT EXISTS) e aborta
-- se alguma das colunas existir com tipo diferente de numeric.
--
-- Reversão (somente em banco local): ALTER TABLE public.trees DROP COLUMN ... para as 12 colunas.

ALTER TABLE public.trees
  ADD COLUMN IF NOT EXISTS dap_20a_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_20a_min_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_20a_max_cm numeric,
  ADD COLUMN IF NOT EXISTS altura_20a_m numeric,
  ADD COLUMN IF NOT EXISTS altura_20a_min_m numeric,
  ADD COLUMN IF NOT EXISTS altura_20a_max_m numeric,
  ADD COLUMN IF NOT EXISTS dap_30a_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_30a_min_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_30a_max_cm numeric,
  ADD COLUMN IF NOT EXISTS altura_30a_m numeric,
  ADD COLUMN IF NOT EXISTS altura_30a_min_m numeric,
  ADD COLUMN IF NOT EXISTS altura_30a_max_m numeric;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM unnest(ARRAY[
      'dap_20a_cm', 'dap_20a_min_cm', 'dap_20a_max_cm',
      'altura_20a_m', 'altura_20a_min_m', 'altura_20a_max_m',
      'dap_30a_cm', 'dap_30a_min_cm', 'dap_30a_max_cm',
      'altura_30a_m', 'altura_30a_min_m', 'altura_30a_max_m'
    ]::text[]) AS esperado(coluna)
    LEFT JOIN information_schema.columns c
      ON c.table_schema = 'public'
     AND c.table_name = 'trees'
     AND c.column_name = esperado.coluna
    WHERE c.column_name IS NULL OR c.data_type <> 'numeric'
  ) THEN
    RAISE EXCEPTION 'Uma ou mais colunas de projeção 20/30 anos estão ausentes ou não são numeric.';
  END IF;
END $$;

COMMENT ON COLUMN public.trees.dap_20a_cm IS 'DAP projetado aos 20 anos (cm), conforme carga auditável do Plantei Certo';
COMMENT ON COLUMN public.trees.altura_20a_m IS 'Altura projetada aos 20 anos (m), conforme carga auditável do Plantei Certo';
COMMENT ON COLUMN public.trees.dap_30a_cm IS 'DAP projetado aos 30 anos (cm), conforme carga auditável do Plantei Certo';
COMMENT ON COLUMN public.trees.altura_30a_m IS 'Altura projetada aos 30 anos (m), conforme carga auditável do Plantei Certo';
