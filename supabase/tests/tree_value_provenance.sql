-- Teste do esquema public.tree_value_provenance
-- (supabase/migrations/20261017000100_create_tree_value_provenance.sql).
--
-- Roda dentro de uma transação que termina em ROLLBACK: não deixa nada no banco.
-- Nunca use `supabase db reset` para rodar este teste.
--
-- RED (migration ainda não aplicada; a tabela não existe):
--   docker exec -i supabase_db_PlanteiCerto psql -U postgres -d postgres \
--     -v ON_ERROR_STOP=1 < supabase/tests/tree_value_provenance.sql
--   esperado: ERROR:  relation "public.tree_value_provenance" does not exist
--
-- GREEN (aplica a migration dentro da mesma transação de teste; o ROLLBACK final
-- desfaz tudo, inclusive a migration; o BEGIN extra só gera WARNING):
--   { echo 'BEGIN;'; \
--     cat supabase/migrations/20261017000100_create_tree_value_provenance.sql \
--         supabase/tests/tree_value_provenance.sql; } \
--     | docker exec -i supabase_db_PlanteiCerto psql -U postgres -d postgres -v ON_ERROR_STOP=1
--   esperado: NOTICE:  tree_value_provenance: OK  (exit 0)
--
-- Fixtures (ids fora da faixa real do catálogo): árvores 990001 (ativa) e 990002
-- (inativa); usuários de auth 99000000-0000-0000-0000-00000000000a (admin) e
-- ...0b (comum).

BEGIN;

INSERT INTO public.trees (id, nome_cientifico, nome_popular, origem, ativa, compat_fiacao, altura_adulta_max_m)
VALUES
  (990001, 'Teste provenienciae', 'teste-ativa',   'Nativa BR', true,  'A', 12.0),
  (990002, 'Teste provenienciae inativa', 'teste-inativa', 'Exótica', false, NULL, NULL);

-- Usuários de teste; o trigger on_auth_user_created cria os perfis (role 'user').
INSERT INTO auth.users (id, email) VALUES
  ('99000000-0000-0000-0000-00000000000a', 'prov-admin@teste.invalid'),
  ('99000000-0000-0000-0000-00000000000b', 'prov-comum@teste.invalid');
UPDATE public.profiles SET role = 'admin' WHERE id = '99000000-0000-0000-0000-00000000000a';

-- 1. Inserções válidas: estimada por rubrica, número com unidade e DAP aos 10 anos.
INSERT INTO public.tree_value_provenance (tree_id, campo, origem, aba_origem, valor_registrado)
VALUES (990001, 'compat_fiacao', 'estimated_rubric', 'Parametrização 25', 'A');

INSERT INTO public.tree_value_provenance (tree_id, campo, origem, aba_origem, valor_registrado, unidade)
VALUES (990001, 'altura_adulta_max_m', 'published_table', 'Projeções e fontes', '12.0', 'm');

INSERT INTO public.tree_value_provenance
  (tree_id, campo, variavel, idade_anos, origem, aba_origem, valor_registrado, unidade, min_operacional, max_operacional)
VALUES (990001, 'dap_10a_cm', 'dap', 10, 'estimated', 'Projeções e fontes', '8.5', 'cm', 7.0, 10.0);

INSERT INTO public.tree_value_provenance (tree_id, campo, origem, aba_origem)
VALUES (990002, 'compat_fiacao', 'estimated_rubric', 'Parametrização 25');

-- Campo que não existe na tabela trees (ex.: coluna de 20 anos ausente no banco
-- local): a linha é aceita e nunca é marcada como alterada.
INSERT INTO public.tree_value_provenance (tree_id, campo, variavel, idade_anos, origem, aba_origem)
VALUES (990001, 'dap_20a_cm', 'dap', 20, 'estimated', 'Projeções e fontes');

DO $$
BEGIN
  -- As nove chaves de origem são aceitas.
  INSERT INTO public.tree_value_provenance (tree_id, campo, origem, aba_origem)
  SELECT 990001, 'campo_origem_' || o, o, 'teste'
  FROM unnest(ARRAY[
    'published_table', 'published_equation', 'published_description',
    'estimated', 'estimated_rubric', 'estimated_taxon_proxy',
    'retido_da_fase_anterior', 'consolidado_de_registro_inativo',
    'sem_dado_admissivel'
  ]) AS o;
  IF (SELECT count(*) FROM public.tree_value_provenance WHERE campo LIKE 'campo_origem_%') <> 9 THEN
    RAISE EXCEPTION 'esperava 9 origens válidas aceitas';
  END IF;
  DELETE FROM public.tree_value_provenance WHERE campo LIKE 'campo_origem_%';
END $$;

-- 2. Origem inventada é rejeitada.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.tree_value_provenance (tree_id, campo, origem, aba_origem)
    VALUES (990001, 'tolerancia_seca_1a5', 'inventado', 'teste');
    RAISE EXCEPTION 'esperava check_violation para origem inventada';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
END $$;

-- 3. Segunda proveniência para o mesmo (tree_id, campo) é rejeitada.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.tree_value_provenance (tree_id, campo, origem, aba_origem)
    VALUES (990001, 'compat_fiacao', 'estimated', 'teste');
    RAISE EXCEPTION 'esperava unique_violation para (tree_id, campo) repetido';
  EXCEPTION WHEN unique_violation THEN
    NULL;
  END;
END $$;

-- 4. variavel e idade_anos andam juntos; idade restrita a 10/20/30; variavel a dap/altura.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.tree_value_provenance (tree_id, campo, variavel, origem, aba_origem)
    VALUES (990001, 'altura_10a_m', 'dap', 'estimated', 'teste');
    RAISE EXCEPTION 'esperava check_violation para variavel sem idade_anos';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;

  BEGIN
    INSERT INTO public.tree_value_provenance (tree_id, campo, idade_anos, origem, aba_origem)
    VALUES (990001, 'altura_10a_m', 10, 'estimated', 'teste');
    RAISE EXCEPTION 'esperava check_violation para idade_anos sem variavel';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;

  BEGIN
    INSERT INTO public.tree_value_provenance (tree_id, campo, variavel, idade_anos, origem, aba_origem)
    VALUES (990001, 'altura_10a_m', 'altura', 15, 'estimated', 'teste');
    RAISE EXCEPTION 'esperava check_violation para idade_anos fora de 10/20/30';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;

  BEGIN
    INSERT INTO public.tree_value_provenance (tree_id, campo, variavel, idade_anos, origem, aba_origem)
    VALUES (990001, 'altura_10a_m', 'carbono', 10, 'estimated', 'teste');
    RAISE EXCEPTION 'esperava check_violation para variavel fora de dap/altura';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
END $$;

-- 5. Trigger: nada foi marcado até aqui, e atualizações sem mudança de valor não marcam.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.tree_value_provenance WHERE valor_alterado_em IS NOT NULL) THEN
    RAISE EXCEPTION 'nenhuma proveniência deveria estar marcada como alterada antes dos UPDATEs';
  END IF;

  -- Regravar o mesmo valor não marca.
  UPDATE public.trees SET compat_fiacao = compat_fiacao WHERE id = 990001;
  IF (SELECT valor_alterado_em FROM public.tree_value_provenance
      WHERE tree_id = 990001 AND campo = 'compat_fiacao') IS NOT NULL THEN
    RAISE EXCEPTION 'regravar o mesmo compat_fiacao marcou valor_alterado_em';
  END IF;

  -- 12 sobre 12.0 numa linha que também muda outro campo: o trigger dispara (a linha
  -- mudou), mas a comparação em jsonb trata 12 e 12.0 como o mesmo número (em texto
  -- seriam diferentes), então altura_adulta_max_m não é marcada. Este caso vem antes
  -- do UPDATE simples abaixo porque este grava a escala 12 e apagaria o 12.0 de partida.
  UPDATE public.trees SET altura_adulta_max_m = 12, nome_popular = 'z' WHERE id = 990001;
  IF (SELECT valor_alterado_em FROM public.tree_value_provenance
      WHERE tree_id = 990001 AND campo = 'altura_adulta_max_m') IS NOT NULL THEN
    RAISE EXCEPTION 'regravar 12 sobre 12.0 junto de outra alteração marcou valor_alterado_em';
  END IF;

  -- Só 12 sobre 12.0, sem outra alteração: não marca.
  UPDATE public.trees SET altura_adulta_max_m = 12 WHERE id = 990001;
  IF (SELECT valor_alterado_em FROM public.tree_value_provenance
      WHERE tree_id = 990001 AND campo = 'altura_adulta_max_m') IS NOT NULL THEN
    RAISE EXCEPTION 'regravar 12 sobre 12.0 marcou valor_alterado_em';
  END IF;

  -- Campo sem proveniência (nome_popular) não marca as linhas de outros campos.
  UPDATE public.trees SET nome_popular = 'x' WHERE id = 990001;
  IF EXISTS (SELECT 1 FROM public.tree_value_provenance
             WHERE tree_id = 990001 AND valor_alterado_em IS NOT NULL) THEN
    RAISE EXCEPTION 'alterar nome_popular marcou proveniência de outro campo';
  END IF;
END $$;

-- 6. Trigger: valor realmente alterado marca só a linha do campo alterado.
DO $$
BEGIN
  UPDATE public.trees SET compat_fiacao = 'C' WHERE id = 990001;
  IF (SELECT valor_alterado_em FROM public.tree_value_provenance
      WHERE tree_id = 990001 AND campo = 'compat_fiacao') IS NULL THEN
    RAISE EXCEPTION 'alterar compat_fiacao não marcou valor_alterado_em';
  END IF;
  IF EXISTS (SELECT 1 FROM public.tree_value_provenance
             WHERE tree_id = 990001 AND campo <> 'compat_fiacao' AND valor_alterado_em IS NOT NULL) THEN
    RAISE EXCEPTION 'alterar compat_fiacao marcou a proveniência de outro campo';
  END IF;
  IF EXISTS (SELECT 1 FROM public.tree_value_provenance
             WHERE tree_id = 990002 AND valor_alterado_em IS NOT NULL) THEN
    RAISE EXCEPTION 'alterar a árvore 990001 marcou proveniência da árvore 990002';
  END IF;

  -- Valor numérico de fato diferente também marca.
  UPDATE public.trees SET altura_adulta_max_m = 13 WHERE id = 990001;
  IF (SELECT valor_alterado_em FROM public.tree_value_provenance
      WHERE tree_id = 990001 AND campo = 'altura_adulta_max_m') IS NULL THEN
    RAISE EXCEPTION 'alterar altura_adulta_max_m de 12 para 13 não marcou valor_alterado_em';
  END IF;

  -- Depois de limpar a marca, alterar campo sem proveniência continua sem marcar.
  UPDATE public.tree_value_provenance SET valor_alterado_em = NULL WHERE tree_id = 990001;
  UPDATE public.trees SET nome_popular = 'y' WHERE id = 990001;
  IF EXISTS (SELECT 1 FROM public.tree_value_provenance
             WHERE tree_id = 990001 AND valor_alterado_em IS NOT NULL) THEN
    RAISE EXCEPTION 'alterar nome_popular remarcou proveniência após limpeza';
  END IF;

  -- Linha de campo inexistente em trees nunca é marcada.
  IF (SELECT valor_alterado_em FROM public.tree_value_provenance
      WHERE tree_id = 990001 AND campo = 'dap_20a_cm') IS NOT NULL THEN
    RAISE EXCEPTION 'campo inexistente em trees foi marcado como alterado';
  END IF;
END $$;

-- 7. RLS: leitura pública só de árvore ativa; escrita só de admin.
-- anon: vê as 4 linhas da árvore ativa (compat_fiacao, altura_adulta_max_m, dap_10a_cm,
-- dap_20a_cm) e nenhuma da inativa; não escreve.
SET LOCAL ROLE anon;
DO $$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n FROM public.tree_value_provenance WHERE tree_id IN (990001, 990002);
  IF n <> 4 THEN
    RAISE EXCEPTION 'anon deveria ver 4 linhas (só da árvore ativa), viu %', n;
  END IF;

  BEGIN
    INSERT INTO public.tree_value_provenance (tree_id, campo, origem, aba_origem)
    VALUES (990001, 'tolerancia_seca_1a5', 'estimated', 'teste');
    RAISE EXCEPTION 'anon não deveria inserir proveniência';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  UPDATE public.tree_value_provenance SET observacao = 'anon' WHERE tree_id = 990001;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN
    RAISE EXCEPTION 'anon atualizou % linhas', n;
  END IF;

  DELETE FROM public.tree_value_provenance WHERE tree_id = 990001;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN
    RAISE EXCEPTION 'anon apagou % linhas', n;
  END IF;
END $$;
RESET ROLE;

-- authenticated sem role admin: mesmo comportamento do anon.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"99000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
DO $$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n FROM public.tree_value_provenance WHERE tree_id IN (990001, 990002);
  IF n <> 4 THEN
    RAISE EXCEPTION 'usuário comum deveria ver 4 linhas (só da árvore ativa), viu %', n;
  END IF;

  BEGIN
    INSERT INTO public.tree_value_provenance (tree_id, campo, origem, aba_origem)
    VALUES (990001, 'tolerancia_seca_1a5', 'estimated', 'teste');
    RAISE EXCEPTION 'usuário comum não deveria inserir proveniência';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  UPDATE public.tree_value_provenance SET observacao = 'comum' WHERE tree_id = 990001;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN
    RAISE EXCEPTION 'usuário comum atualizou % linhas', n;
  END IF;

  DELETE FROM public.tree_value_provenance WHERE tree_id = 990001;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN
    RAISE EXCEPTION 'usuário comum apagou % linhas', n;
  END IF;
END $$;
RESET ROLE;

-- admin: vê também a árvore inativa e escreve.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"99000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
DO $$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n FROM public.tree_value_provenance WHERE tree_id IN (990001, 990002);
  IF n <> 5 THEN
    RAISE EXCEPTION 'admin deveria ver 5 linhas, viu %', n;
  END IF;

  INSERT INTO public.tree_value_provenance (tree_id, campo, origem, aba_origem)
  VALUES (990002, 'tolerancia_seca_1a5', 'estimated', 'teste');

  UPDATE public.tree_value_provenance SET observacao = 'admin' WHERE tree_id = 990002;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 2 THEN
    RAISE EXCEPTION 'admin deveria atualizar 2 linhas da árvore 990002, atualizou %', n;
  END IF;

  DELETE FROM public.tree_value_provenance WHERE tree_id = 990002 AND campo = 'tolerancia_seca_1a5';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'admin deveria apagar 1 linha, apagou %', n;
  END IF;
END $$;
RESET ROLE;

-- 7b. Edição pelo painel: admin altera o valor pela API (role authenticated) e o
-- trigger (SECURITY DEFINER) marca a proveniência.
UPDATE public.tree_value_provenance SET valor_alterado_em = NULL WHERE tree_id = 990001;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"99000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
DO $$
BEGIN
  UPDATE public.trees SET compat_fiacao = 'N' WHERE id = 990001;
  IF (SELECT valor_alterado_em FROM public.tree_value_provenance
      WHERE tree_id = 990001 AND campo = 'compat_fiacao') IS NULL THEN
    RAISE EXCEPTION 'edição de compat_fiacao pelo admin não marcou valor_alterado_em';
  END IF;
END $$;
RESET ROLE;

-- 8. Apagar a árvore apaga a proveniência (ON DELETE CASCADE).
DO $$
BEGIN
  DELETE FROM public.trees WHERE id = 990002;
  IF EXISTS (SELECT 1 FROM public.tree_value_provenance WHERE tree_id = 990002) THEN
    RAISE EXCEPTION 'proveniência da árvore apagada não foi removida em cascata';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE 'tree_value_provenance: OK';
END $$;

ROLLBACK;
