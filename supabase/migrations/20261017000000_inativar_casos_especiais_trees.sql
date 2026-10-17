-- Inativa os três casos especiais que ficaram fora da carga de 152 espécies
-- (supabase/snippets/trees-catalog-import-20261003).
--
-- Fonte da decisão: abas "Remover ou inativar" e "Plano inativação" de
-- Plantei_Certo_Carga_152_Homologacao_Condicional.xlsx, que marcam os três como
-- NÃO ATIVAR. O SQL 04 da carga não os tratou e eles permaneceram ativos
-- (155 ativos no catálogo em vez de 152).
--
--   41  Syagrus romanzoffiana (Jerivá)            hold_outside_safe_layer
--       revisão específica antes de importar ou excluir
--   113 Callistemon imperialis (Calistemon)       exclude_quarantine
--       nome hortícola não resolvido; exige voucher, foto diagnóstica ou origem do viveiro
--   152 Tabebuia avellanedae var. paulensis       hold_conditional_migration
--       (Ipê-roxo-anão) sem cultivar documentado → migrar para o ID 154
--       (Handroanthus heptaphyllus); com cultivar → criar entidade própria
--
-- Escopo: apenas ativa = false. Não exclui registros, não migra referências em
-- points/user_favorites e não executa a migração condicional 152 → 154.
--
-- Já aplicado manualmente em produção em 17/10/2026. A migration é idempotente:
-- não altera nada se os IDs já estiverem inativos ou não existirem (ex.: banco
-- local antes do seed) e aborta se algum ID existir com outro nome científico.
--
-- Reversão: UPDATE public.trees SET ativa = true WHERE id IN (41, 113, 152);

DO $$
DECLARE
  divergencias integer;
  atualizados integer;
  refs_points integer;
  refs_favoritos integer;
BEGIN
  SELECT count(*) INTO divergencias
  FROM (VALUES
      (41,  'Syagrus romanzoffiana'),
      (113, 'Callistemon imperialis'),
      (152, 'Tabebuia avellanedae var. paulensis')
  ) AS esperado(id, nome_cientifico)
  JOIN public.trees t ON t.id = esperado.id
  WHERE t.nome_cientifico IS DISTINCT FROM esperado.nome_cientifico;

  IF divergencias <> 0 THEN
    RAISE EXCEPTION
      'Inativação dos casos especiais interrompida: % ID(s) com nome científico diferente do esperado.',
      divergencias;
  END IF;

  UPDATE public.trees
  SET ativa = false
  WHERE id IN (41, 113, 152)
    AND ativa IS TRUE;
  GET DIAGNOSTICS atualizados = ROW_COUNT;

  SELECT count(*) INTO refs_points
  FROM public.points WHERE tree_id IN (41, 113, 152);

  SELECT count(*) INTO refs_favoritos
  FROM public.user_favorites WHERE tree_id IN (41, 113, 152);

  RAISE NOTICE
    'Casos especiais: % registro(s) inativado(s) agora. Referências mantidas: % em points, % em user_favorites.',
    atualizados, refs_points, refs_favoritos;
END $$;
