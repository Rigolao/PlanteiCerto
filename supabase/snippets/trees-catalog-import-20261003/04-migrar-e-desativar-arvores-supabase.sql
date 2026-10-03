-- Migra referências e desativa 17 registros duplicados com destino definido.
-- Não exclui árvores nem resolve os IDs 41, 113 e 152, que permanecem pendentes.
-- Execute depois de 02-atualizar-arvores-supabase.sql e 03-projecoes-20-30-arvores-supabase.sql.
BEGIN;

DO $$
DECLARE
  divergencias integer;
BEGIN
  IF to_regclass('public.trees') IS NULL
     OR to_regclass('public.points') IS NULL
     OR to_regclass('public.user_favorites') IS NULL THEN
    RAISE EXCEPTION 'Esquema esperado não encontrado. Rode o preflight e adapte o script antes de continuar.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    WHERE c.contype = 'f'
      AND c.confrelid = 'public.trees'::regclass
      AND c.conrelid NOT IN ('public.points'::regclass, 'public.user_favorites'::regclass)
  ) THEN
    RAISE EXCEPTION 'Há FKs para public.trees além de points/user_favorites. Migre-as antes de desativar.';
  END IF;

  SELECT count(*) INTO divergencias
  FROM (VALUES
      (9, 10, 'Pterocarpus violaceus Vogel'),
      (20, 98, 'Schinus terebinthifolius'),
      (80, 10, 'Pterocarpus rohrii'),
      (82, 11, 'Platypodium elegans'),
      (91, 23, 'Tabebuia avellanedae'),
      (93, 12, 'Ligustrum lucidum'),
      (96, 13, 'Holocalyx balansae'),
      (97, 19, 'Calyptranthes clusiifolia'),
      (99, 23, 'Handroanthus impetiginosus'),
      (107, 86, 'Stifftia crysantha Mikan'),
      (108, 8, 'Luehea divaricata'),
      (117, 84, 'Rapanea ferruginea'),
      (120, 79, 'Senna fistula (L.) H.S.Irwin & Barneby'),
      (123, 89, 'Trichilia claussenii'),
      (140, 7, 'Casearia sylvestris'),
      (153, 23, 'Tabebuia impetiginosa'),
      (188, 106, 'Pterygota brasiliensis')
  ) AS esperado(id_origem, id_destino, nome_cientifico)
  LEFT JOIN public.trees origem ON origem.id = esperado.id_origem
  LEFT JOIN public.trees destino ON destino.id = esperado.id_destino AND destino.ativa IS TRUE
  WHERE origem.id IS NULL
     OR origem.nome_cientifico IS DISTINCT FROM esperado.nome_cientifico
     OR origem.ativa IS DISTINCT FROM TRUE
     OR destino.id IS NULL;

  IF divergencias <> 0 THEN
    RAISE EXCEPTION 'Há % divergências nos 17 pares origem/destino ou o destino não está ativo.', divergencias;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_favorites f_origem
    JOIN (VALUES
      (9, 10),
      (20, 98),
      (80, 10),
      (82, 11),
      (91, 23),
      (93, 12),
      (96, 13),
      (97, 19),
      (99, 23),
      (107, 86),
      (108, 8),
      (117, 84),
      (120, 79),
      (123, 89),
      (140, 7),
      (153, 23),
      (188, 106)
    ) AS m(id_origem, id_destino) ON f_origem.tree_id = m.id_origem
    JOIN public.user_favorites f_destino
      ON f_destino.user_id = f_origem.user_id
     AND f_destino.tree_id = m.id_destino
  ) THEN
    RAISE EXCEPTION 'Há favoritos duplicados para o mesmo usuário/destino. Resolva-os manualmente e rode novamente.';
  END IF;
END $$;

UPDATE public.points p
SET tree_id = m.id_destino
FROM (VALUES
  (9, 10),
  (20, 98),
  (80, 10),
  (82, 11),
  (91, 23),
  (93, 12),
  (96, 13),
  (97, 19),
  (99, 23),
  (107, 86),
  (108, 8),
  (117, 84),
  (120, 79),
  (123, 89),
  (140, 7),
  (153, 23),
  (188, 106)
) AS m(id_origem, id_destino)
WHERE p.tree_id = m.id_origem;

UPDATE public.user_favorites f
SET tree_id = m.id_destino
FROM (VALUES
  (9, 10),
  (20, 98),
  (80, 10),
  (82, 11),
  (91, 23),
  (93, 12),
  (96, 13),
  (97, 19),
  (99, 23),
  (107, 86),
  (108, 8),
  (117, 84),
  (120, 79),
  (123, 89),
  (140, 7),
  (153, 23),
  (188, 106)
) AS m(id_origem, id_destino)
WHERE f.tree_id = m.id_origem;

UPDATE public.trees
SET ativa = FALSE
WHERE id IN (9, 20, 80, 82, 91, 93, 96, 97, 99, 107, 108, 117, 120, 123, 140, 153, 188);

COMMIT;
