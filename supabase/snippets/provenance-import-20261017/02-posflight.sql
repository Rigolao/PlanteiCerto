-- Pós-carga da proveniência por valor — 17/10/2026. SOMENTE LEITURA.
-- Rode logo depois de 01-importar-proveniencia.sql, em outra sessão do SQL Editor.
-- Os resultados esperados estão em comentário acima de cada consulta. O bloco DO no
-- fim confere os mesmos números e termina com o aviso
-- "Pós-carga da proveniência: OK" ou com erro descrevendo o que divergiu.

-- 1. Total. Esperado: 1480.
SELECT count(*) AS total
FROM public.tree_value_provenance;

-- 2. Por aba. Esperado:
--   Parametrização 25      1025
--   Projeções e fontes      447
--   SQL 06 (03/10/2026)       8
SELECT aba_origem, count(*) AS registros
FROM public.tree_value_provenance
GROUP BY aba_origem
ORDER BY aba_origem;

-- 3. Por origem. Esperado:
--   consolidado_de_registro_inativo      8
--   estimated                          369  (331 projeções + 38 parametrização)
--   estimated_rubric                   275
--   estimated_taxon_proxy                6
--   published_description               74
--   published_equation                  51
--   published_table                     65
--   retido_da_fase_anterior            144
--   sem_dado_admissivel                488
SELECT origem, count(*) AS registros
FROM public.tree_value_provenance
GROUP BY origem
ORDER BY origem;

-- 4. Projeções por variável e idade. Esperado:
--   altura 10 152 | altura 20 32 | altura 30 27 | dap 10 152 | dap 20 42 | dap 30 42
SELECT variavel, idade_anos, count(*) AS registros
FROM public.tree_value_provenance
WHERE aba_origem = 'Projeções e fontes'
GROUP BY variavel, idade_anos
ORDER BY variavel, idade_anos;

-- 5. estimated_rubric: as 11 notas 1–5 × 25 espécies. Esperado: 11 linhas, todas
--    com campo terminado em _1a5 e 25 registros.
SELECT campo, count(*) AS registros
FROM public.tree_value_provenance
WHERE origem = 'estimated_rubric'
GROUP BY campo
ORDER BY campo;

-- 6. sem_dado_admissivel com valor preenchido em public.trees. Esperado: 0 linhas
--    (as 488 lacunas continuam NULL).
SELECT p.tree_id, p.campo, to_jsonb(t) -> p.campo AS valor_em_trees
FROM public.tree_value_provenance p
JOIN public.trees t ON t.id = p.tree_id
WHERE p.origem = 'sem_dado_admissivel'
  AND (to_jsonb(t) -> p.campo) <> 'null'::jsonb
ORDER BY p.tree_id, p.campo;

-- 7. Campos registrados que não existem em public.trees. Esperado: 0 linhas.
SELECT p.tree_id, p.campo
FROM public.tree_value_provenance p
JOIN public.trees t ON t.id = p.tree_id
WHERE NOT (to_jsonb(t) ? p.campo)
ORDER BY p.tree_id, p.campo;

-- 8. Projeções cujo valor, mínimo ou máximo difere de public.trees. Esperado: 0 linhas.
SELECT p.tree_id, p.campo, p.valor_registrado, p.min_operacional, p.max_operacional
FROM public.tree_value_provenance p
JOIN public.trees t ON t.id = p.tree_id
WHERE p.aba_origem = 'Projeções e fontes'
  AND (
       (to_jsonb(t) ->> p.campo)::numeric IS DISTINCT FROM p.valor_registrado::numeric
    OR (to_jsonb(t) ->> (p.variavel || '_' || p.idade_anos || 'a_min_' || CASE p.variavel WHEN 'dap' THEN 'cm' ELSE 'm' END))::numeric
         IS DISTINCT FROM p.min_operacional
    OR (to_jsonb(t) ->> (p.variavel || '_' || p.idade_anos || 'a_max_' || CASE p.variavel WHEN 'dap' THEN 'cm' ELSE 'm' END))::numeric
         IS DISTINCT FROM p.max_operacional
  )
ORDER BY p.tree_id, p.campo;

-- 9. Os 8 valores consolidados (82→11, 97→19, 120→79). Esperado: 8 linhas, nenhum
--    valor_em_trees NULL.
SELECT p.tree_id, p.campo, p.valor_registrado, to_jsonb(t) -> p.campo AS valor_em_trees, p.fonte
FROM public.tree_value_provenance p
JOIN public.trees t ON t.id = p.tree_id
WHERE p.origem = 'consolidado_de_registro_inativo'
ORDER BY p.tree_id, p.campo;

-- 10. Valores alterados depois do registro da fonte. Esperado logo após a carga: 0.
SELECT count(*) AS valores_alterados
FROM public.tree_value_provenance
WHERE valor_alterado_em IS NOT NULL;

-- 11. Catálogo. Esperado: total 192, ativas 152, inativas 40.
SELECT count(*) AS total,
       count(*) FILTER (WHERE ativa) AS ativas,
       count(*) FILTER (WHERE NOT ativa) AS inativas
FROM public.trees;

-- 12. Conferência automática dos números acima.
DO $$
DECLARE
  total integer;
  projecoes integer;
  parametrizacao integer;
  consolidacao integer;
  rubrica integer;
  rubrica_fora_1a5 integer;
  sem_dado integer;
  sem_dado_preenchido integer;
  campos_inexistentes integer;
  projecoes_divergentes integer;
  consolidados_nulos integer;
  arvores integer;
  ativas integer;
BEGIN
  SELECT count(*),
         count(*) FILTER (WHERE aba_origem = 'Projeções e fontes'),
         count(*) FILTER (WHERE aba_origem = 'Parametrização 25'),
         count(*) FILTER (WHERE aba_origem = 'SQL 06 (03/10/2026)'),
         count(*) FILTER (WHERE origem = 'estimated_rubric'),
         count(*) FILTER (WHERE origem = 'estimated_rubric' AND campo NOT LIKE '%\_1a5'),
         count(*) FILTER (WHERE origem = 'sem_dado_admissivel')
    INTO total, projecoes, parametrizacao, consolidacao, rubrica, rubrica_fora_1a5, sem_dado
  FROM public.tree_value_provenance;

  SELECT count(*) INTO sem_dado_preenchido
  FROM public.tree_value_provenance p
  JOIN public.trees t ON t.id = p.tree_id
  WHERE p.origem = 'sem_dado_admissivel'
    AND (to_jsonb(t) -> p.campo) <> 'null'::jsonb;

  SELECT count(*) INTO campos_inexistentes
  FROM public.tree_value_provenance p
  JOIN public.trees t ON t.id = p.tree_id
  WHERE NOT (to_jsonb(t) ? p.campo);

  SELECT count(*) INTO projecoes_divergentes
  FROM public.tree_value_provenance p
  JOIN public.trees t ON t.id = p.tree_id
  WHERE p.aba_origem = 'Projeções e fontes'
    AND (
         (to_jsonb(t) ->> p.campo)::numeric IS DISTINCT FROM p.valor_registrado::numeric
      OR (to_jsonb(t) ->> (p.variavel || '_' || p.idade_anos || 'a_min_' || CASE p.variavel WHEN 'dap' THEN 'cm' ELSE 'm' END))::numeric
           IS DISTINCT FROM p.min_operacional
      OR (to_jsonb(t) ->> (p.variavel || '_' || p.idade_anos || 'a_max_' || CASE p.variavel WHEN 'dap' THEN 'cm' ELSE 'm' END))::numeric
           IS DISTINCT FROM p.max_operacional
    );

  SELECT count(*) INTO consolidados_nulos
  FROM public.tree_value_provenance p
  JOIN public.trees t ON t.id = p.tree_id
  WHERE p.origem = 'consolidado_de_registro_inativo'
    AND (to_jsonb(t) -> p.campo) = 'null'::jsonb;

  SELECT count(*), count(*) FILTER (WHERE ativa) INTO arvores, ativas
  FROM public.trees;

  IF total <> 1480 THEN
    RAISE EXCEPTION 'Pós-carga da proveniência: total % (esperado 1480).', total;
  END IF;
  IF projecoes <> 447 OR parametrizacao <> 1025 OR consolidacao <> 8 THEN
    RAISE EXCEPTION 'Pós-carga da proveniência: por aba %/%/% (esperado 447/1025/8).',
      projecoes, parametrizacao, consolidacao;
  END IF;
  IF rubrica <> 275 OR rubrica_fora_1a5 <> 0 THEN
    RAISE EXCEPTION 'Pós-carga da proveniência: estimated_rubric % (esperado 275), % fora das notas 1–5.',
      rubrica, rubrica_fora_1a5;
  END IF;
  IF sem_dado <> 488 OR sem_dado_preenchido <> 0 THEN
    RAISE EXCEPTION 'Pós-carga da proveniência: sem_dado_admissivel % (esperado 488), % com valor em public.trees (esperado 0).',
      sem_dado, sem_dado_preenchido;
  END IF;
  IF campos_inexistentes <> 0 THEN
    RAISE EXCEPTION 'Pós-carga da proveniência: % registro(s) com campo inexistente em public.trees.', campos_inexistentes;
  END IF;
  IF projecoes_divergentes <> 0 THEN
    RAISE EXCEPTION 'Pós-carga da proveniência: % projeção(ões) divergem de public.trees.', projecoes_divergentes;
  END IF;
  IF consolidados_nulos <> 0 THEN
    RAISE EXCEPTION 'Pós-carga da proveniência: % valor(es) consolidado(s) NULL em public.trees.', consolidados_nulos;
  END IF;
  IF arvores <> 192 OR ativas <> 152 THEN
    RAISE EXCEPTION 'Pós-carga da proveniência: public.trees com % árvores e % ativas (esperado 192 e 152).',
      arvores, ativas;
  END IF;

  RAISE NOTICE 'Pós-carga da proveniência: OK — 1480 registros (447 projeções, 1025 parametrização, 8 consolidação), 275 estimated_rubric, 488 sem_dado_admissivel NULL em public.trees, 152 árvores ativas de 192.';
END $$;
