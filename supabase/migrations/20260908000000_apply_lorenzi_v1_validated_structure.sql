-- Correções estruturais conferidas visualmente no fac-símile de:
-- Harri Lorenzi, Árvores Brasileiras, volume 1 (1992).
--
-- Escopo: altura adulta máxima e hábito (deciduidade), nos campos em que a
-- ficha fornece um valor inequívoco. DAP não é atualizado porque o diâmetro
-- do tronco descrito pelo livro não especifica o mesmo protocolo de medição.
-- Fenologia não é atualizada por esta migration: varia por região e ano.
-- Nomes taxonômicos e duplicidades permanecem para uma migration editorial.
--
-- Reversão: restaure os valores `expected_*` abaixo para os respectivos IDs.

DO $$
DECLARE
  updated_heights integer;
  updated_habits integer;
BEGIN
  WITH corrections (id, expected_height_m, corrected_height_m, corrected_porte) AS (
    VALUES
      (18,  30::numeric, 12::numeric, 'Médio'::text),    -- Andira fraxinifolia, p. 193
      (71,  20::numeric, 16::numeric, 'Grande'::text),   -- Caesalpinia peltophoroides, p. 148
      (72,  15::numeric, 12::numeric, 'Médio'::text),    -- Clitoria fairchildiana, p. 197
      (82,  30::numeric, 12::numeric, 'Médio'::text),    -- Platypodium elegans, p. 224
      (83,  40::numeric, 25::numeric, 'Grande'::text),   -- Ocotea odorifera, p. 127
      (85,  20::numeric,  8::numeric, 'Médio'::text),    -- Myrsine guianensis, p. 253
      (105, 15::numeric, 14::numeric, 'Médio'::text),    -- Pachira aquatica, p. 66
      (108, 30::numeric, 25::numeric, 'Grande'::text),   -- Luehea divaricata, p. 338
      (110, 35::numeric, 30::numeric, 'Grande'::text),   -- Myrocarpus frondosus, p. 219
      (118, 25::numeric,  5::numeric, 'Pequeno'::text),  -- Metrodorea nigra, p. 309
      (123, 20::numeric, 12::numeric, 'Médio'::text),    -- Trichilia claussenii, p. 244
      (129, 20::numeric, 15::numeric, 'Médio'::text),    -- Couroupita guianensis, p. 137
      (131, 25::numeric, 18::numeric, 'Grande'::text),   -- Lafoensia pacari, p. 230
      (134, 20::numeric, 18::numeric, 'Grande'::text),   -- Lonchocarpus guilleminianus, p. 209
      (138, 30::numeric, 14::numeric, 'Médio'::text),    -- Genipa americana, p. 302
      (150, 15::numeric, 10::numeric, 'Médio'::text),    -- Handroanthus umbellatus, p. 55
      (154, 35::numeric, 20::numeric, 'Grande'::text),   -- Tabebuia heptaphylla, p. 50
      (159, 35::numeric, 20::numeric, 'Grande'::text),   -- Hymenaea courbaril, p. 155
      (160, 10::numeric,  9::numeric, 'Médio'::text),    -- Hymenaea stigonocarpa, p. 156
      (181, 15::numeric, 10::numeric, 'Médio'::text),    -- Senna multijuga, p. 166
      (191, 25::numeric, 16::numeric, 'Grande'::text),   -- Aspidosperma cylindrocarpon, p. 21
      (194, 15::numeric, 30::numeric, 'Grande'::text),   -- Magnolia ovata / Talauma ovata, p. 231
      (197, 25::numeric, 20::numeric, 'Grande'::text)    -- Qualea jundiahy, p. 348
  ),
  updated AS (
    UPDATE public.trees AS tree
    SET
      altura_adulta_max_m = correction.corrected_height_m,
      porte_altura_classe = correction.corrected_porte
    FROM corrections AS correction
    WHERE tree.id = correction.id
      AND tree.altura_adulta_max_m = correction.expected_height_m
    RETURNING tree.id
  )
  SELECT count(*) INTO updated_heights FROM updated;

  IF updated_heights <> 23 THEN
    RAISE EXCEPTION
      'Migration Lorenzi V1 interrompida: esperava atualizar 23 alturas, atualizou %.',
      updated_heights;
  END IF;

  WITH corrections (id, expected_habit, corrected_habit) AS (
    VALUES
      (15,  'Decídua'::text,     'Perenifólia'::text),  -- Protium heptaphyllum, p. 76
      (18,  'Semidecídua'::text, 'Perenifólia'::text),  -- Andira fraxinifolia, p. 193
      (72,  'Perenifólia'::text, 'Decídua'::text),      -- Clitoria fairchildiana, p. 197
      (74,  'Perenifólia'::text, 'Decídua'::text),      -- Vitex polygama, p. 345
      (82,  'Perenifólia'::text, 'Semidecídua'::text),  -- Platypodium elegans, p. 224
      (87,  'Decídua'::text,     'Perenifólia'::text),  -- Protium heptaphyllum, p. 76
      (96,  'Perenifólia'::text, 'Semidecídua'::text),  -- Holocalyx balansae, p. 154
      (105, 'Semidecídua'::text, 'Perenifólia'::text),  -- Pachira aquatica, p. 66
      (126, 'Semidecídua'::text, 'Perenifólia'::text),  -- Sterculia chicha, p. 329
      (150, 'Semidecídua'::text, 'Decídua'::text),      -- Handroanthus umbellatus, p. 55
      (175, 'Perenifólia'::text, 'Semidecídua'::text),  -- Ormosia arborea, p. 221
      (184, 'Decídua'::text,     'Semidecídua'::text),  -- Caesalpinia echinata, p. 145
      (192, 'Semidecídua'::text, 'Perenifólia'::text)   -- Aspidosperma polyneuron, p. 25
  ),
  updated AS (
    UPDATE public.trees AS tree
    SET decidua_perenifolia = correction.corrected_habit
    FROM corrections AS correction
    WHERE tree.id = correction.id
      AND tree.decidua_perenifolia = correction.expected_habit
    RETURNING tree.id
  )
  SELECT count(*) INTO updated_habits FROM updated;

  IF updated_habits <> 13 THEN
    RAISE EXCEPTION
      'Migration Lorenzi V1 interrompida: esperava atualizar 13 hábitos, atualizou %.',
      updated_habits;
  END IF;
END $$;
