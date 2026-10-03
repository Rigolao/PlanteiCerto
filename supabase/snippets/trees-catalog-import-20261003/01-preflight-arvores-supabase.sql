-- Somente leitura. Confirme que a tabela correta é public.trees antes de executar os demais scripts.
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('trees', 'arvores');

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'trees'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'trees'
  AND column_name IN (
    'dap_20a_cm', 'dap_20a_min_cm', 'dap_20a_max_cm',
    'altura_20a_m', 'altura_20a_min_m', 'altura_20a_max_m',
    'dap_30a_cm', 'dap_30a_min_cm', 'dap_30a_max_cm',
    'altura_30a_m', 'altura_30a_min_m', 'altura_30a_max_m'
  )
ORDER BY column_name;

SELECT c.conname AS fk_name,
       c.conrelid::regclass AS tabela_origem,
       pg_get_constraintdef(c.oid) AS definicao
FROM pg_constraint c
WHERE c.contype = 'f' AND c.confrelid = to_regclass('public.trees')
ORDER BY 2, 1;

SELECT count(*) AS total,
       count(*) FILTER (WHERE ativa) AS ativas,
       max(id) AS maior_id
FROM public.trees;

SELECT id, nome_cientifico, nome_popular, ativa
FROM public.trees
WHERE id BETWEEN 199 AND 223
ORDER BY id;
