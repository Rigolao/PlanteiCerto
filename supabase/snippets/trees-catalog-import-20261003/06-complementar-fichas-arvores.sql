-- Complementa fichas canônicas segundo a regra definida pelo autor:
-- preservar todo valor já preenchido no destino; copiar da origem apenas
-- quando o destino estiver NULL. Não altera referências nem a ativa dos IDs.
-- Fonte da comparação: SELECT de public.trees enviado em 2026-10-03.
-- Execute após 04-migrar-e-desativar-arvores-supabase.sql e antes de conferir
-- novamente o estado final. Reexecutável: aceita os valores já copiados, mas
-- valida os valores da origem e o status atual antes de atualizar.

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.trees') IS NULL THEN
    RAISE EXCEPTION 'Tabela public.trees não encontrada.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.trees src JOIN public.trees dst ON dst.id = 11
    WHERE src.id = 82 AND src.ativa IS FALSE AND dst.ativa IS TRUE
      AND src.atracao_fauna_1a5 = 3
      AND src.potencial_sombra_1a5 = 4
      AND src.contribuicao_biodiversidade_1a5 = 4
  ) THEN RAISE EXCEPTION 'Par 82→11 diverge do snapshot/regra; nada foi alterado.'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.trees src JOIN public.trees dst ON dst.id = 19
    WHERE src.id = 97 AND src.ativa IS FALSE AND dst.ativa IS TRUE
      AND src.epoca_floracao = 'Out-Nov'
      AND src.epoca_frutificacao = 'Dez-Jan'
      AND src.altura_primeira_bifurcacao_m = '0,5 - 1,0'
  ) THEN RAISE EXCEPTION 'Par 97→19 diverge do snapshot/regra; nada foi alterado.'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.trees src JOIN public.trees dst ON dst.id = 79
    WHERE src.id = 120 AND src.ativa IS FALSE AND dst.ativa IS TRUE
      AND src.berco_area_min_m2_recomendada = 4
      AND src.volume_solo_min_m3_recomendado = 4
  ) THEN RAISE EXCEPTION 'Par 120→79 diverge do snapshot/regra; nada foi alterado.'; END IF;
END $$;

UPDATE public.trees dst
SET atracao_fauna_1a5 = COALESCE(dst.atracao_fauna_1a5, src.atracao_fauna_1a5),
    potencial_sombra_1a5 = COALESCE(dst.potencial_sombra_1a5, src.potencial_sombra_1a5),
    contribuicao_biodiversidade_1a5 = COALESCE(dst.contribuicao_biodiversidade_1a5, src.contribuicao_biodiversidade_1a5)
FROM public.trees src
WHERE src.id = 82 AND dst.id = 11;

UPDATE public.trees dst
SET epoca_floracao = COALESCE(NULLIF(BTRIM(dst.epoca_floracao), ''), src.epoca_floracao),
    epoca_frutificacao = COALESCE(NULLIF(BTRIM(dst.epoca_frutificacao), ''), src.epoca_frutificacao),
    altura_primeira_bifurcacao_m = COALESCE(NULLIF(BTRIM(dst.altura_primeira_bifurcacao_m), ''), src.altura_primeira_bifurcacao_m)
FROM public.trees src
WHERE src.id = 97 AND dst.id = 19;

UPDATE public.trees dst
SET berco_area_min_m2_recomendada = COALESCE(dst.berco_area_min_m2_recomendada, src.berco_area_min_m2_recomendada),
    volume_solo_min_m3_recomendado = COALESCE(dst.volume_solo_min_m3_recomendado, src.volume_solo_min_m3_recomendado)
FROM public.trees src
WHERE src.id = 120 AND dst.id = 79;

-- Conferência: os oito campos precisam estar preenchidos; valores prévios do destino
-- são válidos e permanecem preservados mesmo quando diferem da origem.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.trees
    WHERE id = 11 AND atracao_fauna_1a5 IS NOT NULL AND potencial_sombra_1a5 IS NOT NULL AND contribuicao_biodiversidade_1a5 IS NOT NULL
  ) OR NOT EXISTS (
    SELECT 1 FROM public.trees
    WHERE id = 19 AND NULLIF(BTRIM(epoca_floracao), '') IS NOT NULL AND NULLIF(BTRIM(epoca_frutificacao), '') IS NOT NULL AND NULLIF(BTRIM(altura_primeira_bifurcacao_m), '') IS NOT NULL
  ) OR NOT EXISTS (
    SELECT 1 FROM public.trees
    WHERE id = 79 AND berco_area_min_m2_recomendada IS NOT NULL AND volume_solo_min_m3_recomendado IS NOT NULL
  ) THEN RAISE EXCEPTION 'A conferência do merge falhou; transação será revertida.'; END IF;
END $$;

COMMIT;

SELECT id, nome_cientifico, atracao_fauna_1a5, potencial_sombra_1a5, contribuicao_biodiversidade_1a5,
       epoca_floracao, epoca_frutificacao, altura_primeira_bifurcacao_m,
       berco_area_min_m2_recomendada, volume_solo_min_m3_recomendado
FROM public.trees
WHERE id IN (11, 19, 79)
ORDER BY id;
