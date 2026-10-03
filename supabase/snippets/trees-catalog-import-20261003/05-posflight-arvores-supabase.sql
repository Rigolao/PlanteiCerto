-- Somente leitura. Rode após os scripts 02, 03 e 04.

-- Resultado esperado: total=192, ativas=155, maior_id=223.
SELECT count(*) AS total,
       count(*) FILTER (WHERE ativa) AS ativas,
       max(id) AS maior_id
FROM public.trees;

-- Deve mostrar 12 linhas, todas com data_type = numeric.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'trees'
  AND column_name IN ('dap_20a_cm', 'dap_20a_min_cm', 'dap_20a_max_cm', 'altura_20a_m', 'altura_20a_min_m', 'altura_20a_max_m', 'dap_30a_cm', 'dap_30a_min_cm', 'dap_30a_max_cm', 'altura_30a_m', 'altura_30a_min_m', 'altura_30a_max_m')
ORDER BY column_name;

-- Cobertura esperada conforme a aba "Projeções 20-30", limitada aos 152 IDs alvo.
SELECT
  count(*) FILTER (WHERE dap_20a_cm IS NOT NULL) AS dap_20a_cm,
  count(*) FILTER (WHERE dap_20a_min_cm IS NOT NULL) AS dap_20a_min_cm,
  count(*) FILTER (WHERE dap_20a_max_cm IS NOT NULL) AS dap_20a_max_cm,
  count(*) FILTER (WHERE altura_20a_m IS NOT NULL) AS altura_20a_m,
  count(*) FILTER (WHERE altura_20a_min_m IS NOT NULL) AS altura_20a_min_m,
  count(*) FILTER (WHERE altura_20a_max_m IS NOT NULL) AS altura_20a_max_m,
  count(*) FILTER (WHERE dap_30a_cm IS NOT NULL) AS dap_30a_cm,
  count(*) FILTER (WHERE dap_30a_min_cm IS NOT NULL) AS dap_30a_min_cm,
  count(*) FILTER (WHERE dap_30a_max_cm IS NOT NULL) AS dap_30a_max_cm,
  count(*) FILTER (WHERE altura_30a_m IS NOT NULL) AS altura_30a_m,
  count(*) FILTER (WHERE altura_30a_min_m IS NOT NULL) AS altura_30a_min_m,
  count(*) FILTER (WHERE altura_30a_max_m IS NOT NULL) AS altura_30a_max_m
FROM public.trees
WHERE id IN (8, 10, 13, 95, 12, 14, 87, 16, 11, 109, 18, 17, 19, 98, 21, 22, 110, 111, 76, 112, 77, 114, 115, 116, 88, 81, 83, 84, 85, 118, 119, 79, 121, 122, 89, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 94, 135, 136, 137, 138, 139, 7, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 104, 151, 23, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 105, 172, 173, 174, 1, 175, 176, 3, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 78, 187, 106, 189, 197, 92, 190, 191, 192, 193, 194, 25, 195, 196, 86, 198, 2, 4, 70, 75, 71, 72, 73, 74, 5, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223);

-- Estes 17 registros devem estar inativos e sem referências remanescentes.
SELECT id, nome_cientifico, ativa
FROM public.trees
WHERE id IN (9, 20, 80, 82, 91, 93, 96, 97, 99, 107, 108, 117, 120, 123, 140, 153, 188)
ORDER BY id;

SELECT 'points' AS tabela, count(*) AS referencias_antigas
FROM public.points
WHERE tree_id IN (9, 20, 80, 82, 91, 93, 96, 97, 99, 107, 108, 117, 120, 123, 140, 153, 188)
UNION ALL
SELECT 'user_favorites', count(*)
FROM public.user_favorites
WHERE tree_id IN (9, 20, 80, 82, 91, 93, 96, 97, 99, 107, 108, 117, 120, 123, 140, 153, 188);

-- Estes três casos foram deixados fora da desativação automática e devem ser revisados.
SELECT id, nome_cientifico, nome_popular, ativa
FROM public.trees
WHERE id IN (41, 113, 152)
ORDER BY id;
