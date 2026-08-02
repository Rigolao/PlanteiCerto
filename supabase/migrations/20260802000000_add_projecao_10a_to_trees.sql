-- Projecao de crescimento em 10 anos por especie
-- Fonte: dados_app_projecao_10_anos_especies_cartilha.xlsx (orientador)
-- Cenario fixo da planilha: muda inicial de DAP 3 cm / altura 1,5 m, "boas condicoes",
-- horizonte de 10 anos. Por serem constantes em todas as linhas, viram texto fixo na
-- UI em vez de coluna.
--
-- O mapeamento especie_id (planilha) -> trees.id esta em scripts/mapa_projecao_10a.csv,
-- gerado e revisado por scripts/gerar_migration_projecao_10a.py. E explicito porque o
-- banco usa nomenclatura antiga (ex.: Tabebuia chrysotricha) e a planilha a atualizada
-- (Handroanthus chrysotrichus).

ALTER TABLE public.trees
  ADD COLUMN IF NOT EXISTS dap_10a_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_10a_min_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_10a_max_cm numeric,
  ADD COLUMN IF NOT EXISTS altura_10a_m numeric,
  ADD COLUMN IF NOT EXISTS altura_10a_min_m numeric,
  ADD COLUMN IF NOT EXISTS altura_10a_max_m numeric,
  ADD COLUMN IF NOT EXISTS biomassa_aerea_10a_kg numeric,
  ADD COLUMN IF NOT EXISTS carbono_armazenado_10a_kg numeric,
  ADD COLUMN IF NOT EXISTS co2e_10a_kg numeric,
  ADD COLUMN IF NOT EXISTS sobrevivencia_10a_pct numeric,
  ADD COLUMN IF NOT EXISTS co2e_esperado_por_muda_10a_kg numeric,
  ADD COLUMN IF NOT EXISTS classe_bvoc text,
  ADD COLUMN IF NOT EXISTS evidencia_bvoc text,
  ADD COLUMN IF NOT EXISTS confianca_bvoc text,
  ADD COLUMN IF NOT EXISTS exibir_aviso_bvoc boolean DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trees_sobrevivencia_10a_pct_check') THEN
    ALTER TABLE public.trees ADD CONSTRAINT trees_sobrevivencia_10a_pct_check
      CHECK (sobrevivencia_10a_pct >= 0 AND sobrevivencia_10a_pct <= 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trees_classe_bvoc_check') THEN
    ALTER TABLE public.trees ADD CONSTRAINT trees_classe_bvoc_check
      CHECK (classe_bvoc = ANY (ARRAY['baixo'::text, 'moderado'::text, 'alto'::text, 'desconhecido'::text, 'indeterminado'::text]));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trees_confianca_bvoc_check') THEN
    ALTER TABLE public.trees ADD CONSTRAINT trees_confianca_bvoc_check
      CHECK (confianca_bvoc = ANY (ARRAY['baixa'::text, 'baixa-média'::text, 'média'::text, 'média-alta'::text]));
  END IF;
END $$;

COMMENT ON COLUMN public.trees.dap_10a_cm IS 'DAP projetado aos 10 anos (cm), cenario boas condicoes, muda inicial 3 cm';
COMMENT ON COLUMN public.trees.altura_10a_m IS 'Altura projetada aos 10 anos (m), cenario boas condicoes, muda inicial 1,5 m';
COMMENT ON COLUMN public.trees.carbono_armazenado_10a_kg IS 'Carbono na biomassa aerea aos 10 anos (kg C) = biomassa x 0,47';
COMMENT ON COLUMN public.trees.co2e_10a_kg IS 'CO2 equivalente aos 10 anos (kg) = carbono x 3,6667';
COMMENT ON COLUMN public.trees.co2e_esperado_por_muda_10a_kg IS 'CO2e esperado por muda plantada aos 10 anos (kg), ja ponderado pela sobrevivencia';
COMMENT ON COLUMN public.trees.classe_bvoc IS 'Classe de emissao de compostos organicos volateis biogenicos';
COMMENT ON COLUMN public.trees.exibir_aviso_bvoc IS 'Sinaliza que a classificacao BVOC tem baixa evidencia e merece ressalva na UI';

-- Backfill: 149 linhas. Idempotente (UPDATE por id), pode rodar de novo.
UPDATE public.trees AS t SET
  dap_10a_cm = v.dap_10a_cm,
  dap_10a_min_cm = v.dap_10a_min_cm,
  dap_10a_max_cm = v.dap_10a_max_cm,
  altura_10a_m = v.altura_10a_m,
  altura_10a_min_m = v.altura_10a_min_m,
  altura_10a_max_m = v.altura_10a_max_m,
  biomassa_aerea_10a_kg = v.biomassa_aerea_10a_kg,
  carbono_armazenado_10a_kg = v.carbono_armazenado_10a_kg,
  co2e_10a_kg = v.co2e_10a_kg,
  sobrevivencia_10a_pct = v.sobrevivencia_10a_pct,
  co2e_esperado_por_muda_10a_kg = v.co2e_esperado_por_muda_10a_kg,
  classe_bvoc = v.classe_bvoc,
  evidencia_bvoc = v.evidencia_bvoc,
  confianca_bvoc = v.confianca_bvoc,
  exibir_aviso_bvoc = v.exibir_aviso_bvoc
FROM (VALUES
    (1, 10.0, 7.9, 12.1, 7.6, 6.075, 9.125, 31.2261, 14.6763, 53.8129, 58.3, 30.759, 'baixo', 'fator de gênero i-Tree', 'baixa-média', true),  -- Oiti
    (2, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.4754, 7.2734, 26.6693, 85.0, 21.9218, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Resedá extremosa
    (3, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.9872, 7.514, 27.5513, 85.0, 22.6468, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Pata-de-vaca
    (4, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.0096, 7.9945, 29.3132, 85.0, 24.0951, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Sabão-de-soldado
    (5, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.5592, 9.1928, 33.707, 85.0, 27.7067, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Uvaia
    (6, 13.0, 10.0, 16.0, 9.5, 7.5, 11.5, 50.4992, 23.7346, 87.027, 85.0, 73.2754, 'alto', 'fator de gênero i-Tree', 'baixa-média', true),  -- Farinha-seca
    (7, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.2429, 7.6342, 27.992, 85.0, 23.0091, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Guaçatonga
    (8, 13.37, 10.1, 15.4, 9.2, 7.52, 10.84, 49.8625, 23.4354, 85.9296, 95.1, 80.9663, 'baixo', 'fator de gênero i-Tree', 'média-alta', false),  -- Açoita-cavalo
    (9, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.0096, 7.9945, 29.3132, 85.0, 24.0951, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Aldrago
    (10, 19.57, 14.44, 24.71, 11.25, 9.66, 12.64, 115.8822, 54.4646, 199.7036, 85.0, 169.1373, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Aldrago miúdo
    (11, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.7952, 8.8337, 32.3904, 85.0, 26.6245, 'desconhecido', 'sem fator localizado', 'baixa', true),  -- Amendoim-do-campo
    (12, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.9872, 7.514, 27.5513, 85.0, 22.6468, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Alfeneiro-do-japão
    (13, 6.0, 5.1, 6.9, 3.5, 3.0, 4.0, 6.295, 2.9587, 10.8484, 85.0, 8.1788, 'desconhecido', 'sem fator localizado', 'baixa-média', true),  -- Alecrim-de-campinas
    (14, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 11.1066, 5.2201, 19.1404, 85.0, 15.7332, 'desconhecido', 'sem fator localizado', 'baixa', true),  -- Algodão-do-brejo
    (15, 11.24, 9.97, 12.51, 7.32, 6.89, 7.72, 32.0885, 15.0816, 55.2992, 85.0, 46.2449, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Almecega
    (16, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.3046, 9.0732, 33.2682, 85.0, 27.3461, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Amarelinho
    (17, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.3224, 9.5515, 35.0223, 85.0, 28.7879, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Araçá
    (18, 11.59, 9.65, 13.51, 7.51, 6.85, 8.11, 38.3359, 18.0179, 66.0655, 85.0, 55.3222, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Angelim-doce
    (19, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.5592, 9.1928, 33.707, 85.0, 27.7067, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Araçarana
    (20, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.0096, 7.9945, 29.3132, 85.0, 24.0951, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Aroeira-pimenteira
    (21, 13.0, 10.0, 16.0, 9.5, 7.5, 11.5, 44.2163, 20.7817, 76.1994, 85.0, 64.1587, 'baixo', 'fator de gênero i-Tree', 'baixa-média', true),  -- Astrapéia
    (22, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 11.8803, 5.5837, 20.4736, 85.0, 16.8291, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Bico-de-pato
    (23, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.0681, 9.432, 34.584, 85.0, 28.4276, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-roxo-de-bola
    (25, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 21.3389, 10.0293, 36.7741, 85.0, 30.2279, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Pitangueira
    (32, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.8137, 9.3124, 34.1455, 85.0, 28.0672, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-branco
    (70, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.4986, 7.7543, 28.4326, 85.0, 23.3712, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Sapateiro, tobocuva
    (71, 16.69, 12.84, 20.59, 10.0, 8.77, 11.11, 123.1215, 57.8671, 212.1794, 85.0, 179.3591, 'baixo', 'fator de gênero i-Tree', 'média', false),  -- Sibipiruna
    (72, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.2194, 7.1531, 26.228, 85.0, 21.5591, 'desconhecido', 'sem fator localizado', 'baixa', true),  -- Sombreiro
    (73, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 7.7373, 3.6365, 13.334, 85.0, 10.9604, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Suinã
    (74, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.4986, 7.7543, 28.4326, 85.0, 23.3712, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Tarumã-do-cerrado
    (75, 15.53, 11.94, 19.11, 9.47, 8.3, 10.5, 100.1806, 47.0849, 172.6446, 85.0, 145.7668, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Sapucaia
    (76, 13.0, 10.0, 16.0, 9.5, 7.5, 11.5, 46.0135, 21.6264, 79.2966, 85.0, 66.7665, 'baixo', 'fator de gênero i-Tree', 'baixa-média', true),  -- Calicarpa
    (77, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.2649, 8.1145, 29.7533, 85.0, 24.4568, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Camboatá
    (78, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.5202, 8.2345, 30.1932, 85.0, 24.8184, 'desconhecido', 'sem fator localizado', 'baixa', true),  -- Pau-marfim
    (79, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.2855, 8.5942, 31.512, 85.0, 25.9024, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Cassia imperial
    (80, 19.57, 14.44, 24.71, 11.25, 9.66, 12.64, 115.8822, 54.4646, 199.7036, 85.0, 169.1373, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Aldrago miúdo
    (81, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.7314, 7.3937, 27.1104, 85.0, 22.2844, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Canela cheirosa
    (82, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.7952, 8.8337, 32.3904, 85.0, 26.6245, 'desconhecido', 'sem fator localizado', 'baixa', true),  -- Amendoim-do-campo
    (83, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 14.1941, 6.6712, 24.4611, 85.0, 20.1067, 'baixo', 'medição direta sazonal no Brasil; nenhum isopreno detectado', 'baixa', true),  -- Canela sassafrás
    (84, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.2194, 7.1531, 26.228, 85.0, 21.5591, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Capororoca
    (85, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 14.9632, 7.0327, 25.7866, 85.0, 21.1962, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Capororoca-do-cerrado
    (86, 6.0, 5.1, 6.9, 3.5, 3.0, 4.0, 3.9884, 1.8745, 6.8733, 85.0, 5.1819, 'moderado', 'fator de gênero i-Tree', 'baixa-média', true),  -- Rabo-de-cutia
    (87, 11.24, 9.97, 12.51, 7.32, 6.89, 7.72, 32.0885, 15.0816, 55.2992, 85.0, 46.2449, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Almecega
    (88, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.4754, 7.2734, 26.6693, 85.0, 21.9218, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Canela amarela
    (89, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.0096, 7.9945, 29.3132, 85.0, 24.0951, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Catiguá vermelho
    (91, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.0681, 9.432, 34.584, 85.0, 28.4276, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-roxo-da-mata
    (92, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.4986, 7.7543, 28.4326, 85.0, 23.3712, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Pau-terra-mirim
    (93, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.9872, 7.514, 27.5513, 85.0, 22.6468, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Alfeneiro-do-japão
    (94, 13.0, 10.0, 16.0, 9.5, 7.5, 11.5, 50.4992, 23.7346, 87.027, 85.0, 73.2754, 'alto', 'fator de gênero i-Tree', 'baixa-média', true),  -- Farinha seca
    (95, 13.0, 10.0, 16.0, 9.5, 7.5, 11.5, 62.1183, 29.1956, 107.0505, 85.0, 90.1348, 'baixo', 'fator de gênero i-Tree', 'baixa-média', true),  -- Aleluia, pau-fava
    (96, 6.0, 5.1, 6.9, 3.5, 3.0, 4.0, 6.295, 2.9587, 10.8484, 85.0, 8.1788, 'desconhecido', 'sem fator localizado', 'baixa-média', true),  -- Alecrim-de-campinas
    (97, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.5592, 9.1928, 33.707, 85.0, 27.7067, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Araçarana
    (98, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.0096, 7.9945, 29.3132, 85.0, 24.0951, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Aroeira-pimenteira
    (99, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.0681, 9.432, 34.584, 85.0, 28.4276, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-roxo-de-bola
    (104, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.8137, 9.3124, 34.1455, 85.0, 28.0672, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-branco
    (105, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 11.8803, 5.5837, 20.4736, 85.0, 16.8291, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Monguba
    (106, 14.61, 11.45, 17.7, 9.04, 8.0, 9.95, 46.4434, 21.8284, 80.0375, 85.0, 67.4957, 'desconhecido', 'sem fator localizado', 'média', false),  -- Pau-rei
    (107, 6.0, 5.1, 6.9, 3.5, 3.0, 4.0, 3.9884, 1.8745, 6.8733, 85.0, 5.1819, 'moderado', 'fator de gênero i-Tree', 'baixa-média', true),  -- Rabo-de-cutia
    (108, 13.37, 10.1, 15.4, 9.2, 7.52, 10.84, 49.8625, 23.4354, 85.9296, 95.1, 80.9663, 'baixo', 'fator de gênero i-Tree', 'média-alta', false),  -- Açoita-cavalo
    (109, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 14.1941, 6.6712, 24.4611, 85.0, 20.1067, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Amoreira
    (110, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.5404, 8.714, 31.9513, 85.0, 26.2635, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Cabreúva-amarela
    (111, 6.0, 5.1, 6.9, 3.5, 3.0, 4.0, 5.9246, 2.7846, 10.2101, 85.0, 7.6975, 'moderado', 'fator de gênero i-Tree', 'baixa-média', true),  -- Cabreúva-vermelha
    (112, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.2649, 8.1145, 29.7533, 85.0, 24.4568, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Calistemon
    (113, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.2649, 8.1145, 29.7533, 85.0, 24.4568, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Calistemon
    (114, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.2855, 8.5942, 31.512, 85.0, 25.9024, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Cambuci
    (115, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.5766, 9.671, 35.4604, 85.0, 29.148, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Cambuí
    (116, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.0096, 7.9945, 29.3132, 85.0, 24.0951, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Canafístula
    (117, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.2194, 7.1531, 26.228, 85.0, 21.5591, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Capororoca
    (118, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.7952, 8.8337, 32.3904, 85.0, 26.6245, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Caputuna-preta
    (119, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.9872, 7.514, 27.5513, 85.0, 22.6468, 'baixo', 'medição direta sazonal no Brasil; nenhum isopreno detectado', 'baixa', true),  -- Caqui-do-mato, olho-de-boi
    (120, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.2855, 8.5942, 31.512, 85.0, 25.9024, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Cassia imperial
    (121, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.4986, 7.7543, 28.4326, 85.0, 23.3712, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Cassia javanesa, cassia rosa
    (122, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.2429, 7.6342, 27.992, 85.0, 23.0091, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Catiguá
    (123, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.0096, 7.9945, 29.3132, 85.0, 24.0951, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Catiguá vermelho
    (124, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 11.8803, 5.5837, 20.4736, 85.0, 16.8291, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Cedro
    (125, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.2855, 8.5942, 31.512, 85.0, 25.9024, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Cerejeira-do-rio-grande
    (126, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 10.5901, 4.9774, 18.2503, 85.0, 15.0015, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Chichá
    (127, 13.31, 7.21, 19.28, 8.4, 6.18, 10.11, 51.0485, 23.9928, 87.9736, 85.0, 74.0181, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Copaíba
    (128, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.8308, 9.7905, 35.8984, 85.0, 29.5081, 'desconhecido', 'sem fator localizado', 'baixa', true),  -- Coração-de-negro
    (129, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 11.6225, 5.4626, 20.0295, 85.0, 16.464, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Corrupita, abricó-de-macaco
    (130, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.0096, 7.9945, 29.3132, 85.0, 24.0951, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Craveiro-da-índia
    (131, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.5202, 8.2345, 30.1932, 85.0, 24.8184, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Dedaleira
    (132, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.5404, 8.714, 31.9513, 85.0, 26.2635, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Embira-de-sapo, feijão cru
    (133, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 21.0849, 9.9099, 36.3363, 85.0, 29.868, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Falsa murta
    (134, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.5404, 8.714, 31.9513, 85.0, 26.2635, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Falso-timbó, ingá-bravo
    (135, 6.0, 5.1, 6.9, 3.5, 3.0, 4.0, 5.7763, 2.7149, 9.9545, 85.0, 7.5048, 'desconhecido', 'sem fator localizado', 'baixa-média', true),  -- Faveira, sucupira lisa
    (136, 13.0, 10.0, 16.0, 9.5, 7.5, 11.5, 59.4421, 27.9378, 102.4386, 85.0, 86.2516, 'baixo', 'fator de gênero i-Tree', 'baixa-média', true),  -- Folha-de-castanha
    (137, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.2194, 7.1531, 26.228, 85.0, 21.5591, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Fruto-de-pombo, murta-branca
    (138, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.7541, 7.8744, 28.873, 85.0, 23.7332, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Genipapo
    (139, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.0499, 8.9535, 32.8294, 85.0, 26.9854, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Grumixama
    (140, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.2429, 7.6342, 27.992, 85.0, 23.0091, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Guaçatonga
    (141, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.5404, 8.714, 31.9513, 85.0, 26.2635, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Guaraiuva
    (142, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.3224, 9.5515, 35.0223, 85.0, 28.7879, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Guarantã
    (143, 13.0, 10.63, 15.18, 8.24, 7.45, 8.9, 58.7148, 27.596, 101.1852, 85.0, 85.0755, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Guaritá
    (144, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 13.4239, 6.3092, 23.1339, 85.0, 19.0158, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Ingá do brejo
    (145, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.8308, 9.7905, 35.8984, 85.0, 29.5081, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-amarelo
    (146, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.8137, 9.3124, 34.1455, 85.0, 28.0672, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-amarelo
    (147, 10.75, 9.31, 12.18, 7.05, 6.56, 7.5, 36.6304, 17.2163, 63.1263, 85.0, 52.6763, 'baixo', 'fator de gênero i-Tree', 'média', false),  -- Ipê-amarelo
    (148, 14.18, 10.65, 17.68, 8.83, 7.65, 9.86, 87.1597, 40.965, 150.2051, 85.0, 126.583, 'baixo', 'fator de gênero i-Tree', 'média', false),  -- Ipê-amarelo
    (149, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.8137, 9.3124, 34.1455, 85.0, 28.0672, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-amarelo-da-mata
    (150, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.8137, 9.3124, 34.1455, 85.0, 28.0672, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-amarelo-do-brejo
    (151, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 13.6807, 6.4299, 23.5765, 85.0, 19.3796, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-rosa
    (152, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.0681, 9.432, 34.584, 85.0, 28.4276, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-roxo-anão
    (153, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 20.0681, 9.432, 34.584, 85.0, 28.4276, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-roxo-de-bola
    (154, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 21.3389, 10.0293, 36.7741, 85.0, 30.2279, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Ipê-roxo
    (155, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 19.8137, 9.3124, 34.1455, 85.0, 28.0672, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Jacarandá paulista
    (156, 19.97, 14.85, 25.12, 11.42, 9.85, 12.81, 184.1782, 86.5638, 317.4005, 85.0, 268.8708, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Jacarandá-da-Bahia
    (157, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.2429, 7.6342, 27.992, 85.0, 23.0091, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Jambo amarelo
    (158, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 13.4239, 6.3092, 23.1339, 85.0, 19.0158, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Jambo vermelho
    (159, 17.19, 13.79, 20.61, 10.23, 9.16, 11.2, 125.1072, 58.8004, 215.6014, 85.0, 182.3293, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Jatobá
    (160, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.2855, 8.5942, 31.512, 85.0, 25.9024, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Jatobá-do-cerrado
    (161, 17.67, 12.96, 22.38, 10.44, 8.94, 11.75, 106.1642, 49.8972, 182.9564, 85.0, 154.7782, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Jequitibá branco
    (162, 21.25, 17.72, 24.74, 11.94, 10.9, 12.88, 147.1659, 69.168, 253.616, 85.0, 214.9504, 'moderado', 'fator de gênero i-Tree', 'média', false),  -- Jequitibá rosa
    (163, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.7314, 7.3937, 27.1104, 85.0, 22.2844, 'desconhecido', 'sem fator localizado', 'baixa', true),  -- Lofântera
    (164, 13.56, 9.12, 17.97, 8.53, 7.0, 9.82, 52.862, 24.8452, 91.0989, 85.0, 76.687, 'baixo', 'proxy de gênero: medição direta de Cordia sellowiana no Brasil', 'média', false),  -- Louro pardo
    (165, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 13.4239, 6.3092, 23.1339, 85.0, 19.0158, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Magnólia
    (166, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 12.3953, 5.8258, 21.3613, 85.0, 17.5587, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Magnólia amarela
    (167, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 13.9375, 6.5506, 24.0189, 85.0, 19.7432, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Manacá-da-serra
    (168, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 11.8803, 5.5837, 20.4736, 85.0, 16.8291, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Maria-mole
    (169, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.2194, 7.1531, 26.228, 85.0, 21.5591, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Marinheiro, camboatã
    (170, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.7754, 8.3544, 30.6329, 85.0, 25.1799, 'alto', 'fator de gênero i-Tree', 'baixa', true),  -- Melaleuca
    (171, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.0305, 8.4743, 31.0725, 85.0, 25.5412, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Mirindiba
    (172, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 7.7373, 3.6365, 13.334, 85.0, 10.9604, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Mulungu
    (173, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 7.4768, 3.5141, 12.885, 85.0, 10.5913, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Mulungu
    (174, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.5202, 8.2345, 30.1932, 85.0, 24.8184, 'desconhecido', 'sem fator localizado', 'baixa', true),  -- Nó-de-porco, resedá nacional
    (175, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.7314, 7.3937, 27.1104, 85.0, 22.2844, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Olho-de-cabra
    (176, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 7.7373, 3.6365, 13.334, 85.0, 10.9604, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Paineira
    (177, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 14.7069, 6.9123, 25.3449, 85.0, 20.8332, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Pata-de-vaca
    (178, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 14.1941, 6.6712, 24.4611, 85.0, 20.1067, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Pata-de-vaca
    (179, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 14.9632, 7.0327, 25.7866, 85.0, 21.1962, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Pata-de-vaca rosa
    (180, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 13.9375, 6.5506, 24.0189, 85.0, 19.7432, 'moderado', 'isopreno medido diretamente e normalizado; BVOC total não determinado', 'baixa', true),  -- Pata-de-vaca roxa
    (181, 17.92, 13.07, 23.41, 10.55, 9.01, 12.06, 99.0934, 46.5739, 170.7709, 85.0, 144.4948, 'baixo', 'fator de gênero i-Tree', 'média', false),  -- Pau cigarra
    (182, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 13.1669, 6.1885, 22.691, 85.0, 18.6518, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Pau d'alho
    (183, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 18.5404, 8.714, 31.9513, 85.0, 26.2635, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Pau mulato
    (184, 15.45, 12.58, 18.3, 9.44, 8.52, 10.27, 107.5199, 50.5344, 185.2927, 85.0, 156.4319, 'baixo', 'fator de gênero i-Tree', 'média', false),  -- Pau-brasil
    (185, 6.0, 5.1, 6.9, 3.5, 3.0, 4.0, 3.9135, 1.8393, 6.7443, 85.0, 5.0846, 'moderado', 'fator de gênero i-Tree', 'baixa-média', true),  -- Pau-de-tucano
    (186, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 23.8752, 11.2214, 41.145, 85.0, 33.8206, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Pau-ferro
    (187, 13.0, 10.0, 16.0, 9.5, 7.5, 11.5, 61.2265, 28.7765, 105.5137, 85.0, 88.8409, 'moderado', 'fator de gênero i-Tree', 'baixa-média', true),  -- Pau-pereira
    (188, 14.61, 11.45, 17.7, 9.04, 8.0, 9.95, 46.4434, 21.8284, 80.0375, 85.0, 67.4957, 'desconhecido', 'sem fator localizado', 'média', false),  -- Pau-rei
    (189, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.7314, 7.3937, 27.1104, 85.0, 22.2844, 'desconhecido', 'sem fator localizado', 'baixa', true),  -- Pau-ripa
    (190, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 12.9099, 6.0676, 22.248, 85.0, 18.2876, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Peito-do-pombo
    (191, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.2649, 8.1145, 29.7533, 85.0, 24.4568, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Peroba poca
    (192, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.7754, 8.3544, 30.6329, 85.0, 25.1799, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Peroba rosa
    (193, 6.0, 5.1, 6.9, 3.5, 3.0, 4.0, 5.0333, 2.3656, 8.674, 85.0, 6.5395, 'desconhecido', 'sem fator localizado', 'baixa-média', true),  -- Pindaiva
    (194, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 12.1379, 5.7048, 20.9176, 85.0, 17.194, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Pinha-do-brejo
    (195, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 15.2194, 7.1531, 26.228, 85.0, 21.5591, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Quaresmeira
    (196, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 17.5202, 8.2345, 30.1932, 85.0, 24.8184, 'baixo', 'fator de gênero i-Tree', 'baixa', true),  -- Quereltéria
    (197, 9.0, 7.2, 10.8, 5.5, 4.5, 6.5, 16.2429, 7.6342, 27.992, 85.0, 23.0091, 'moderado', 'fator de gênero i-Tree', 'baixa', true),  -- Pau-terra, jundiaí
    (198, 13.0, 10.0, 16.0, 9.5, 7.5, 11.5, 50.4992, 23.7346, 87.027, 85.0, 73.2754, 'indeterminado', 'isopreno não detectado; emissão total de BVOC não determinada', 'baixa-média', true)  -- Resedá de folha graúda
) AS v(tree_id, dap_10a_cm, dap_10a_min_cm, dap_10a_max_cm, altura_10a_m, altura_10a_min_m, altura_10a_max_m, biomassa_aerea_10a_kg, carbono_armazenado_10a_kg, co2e_10a_kg, sobrevivencia_10a_pct, co2e_esperado_por_muda_10a_kg, classe_bvoc, evidencia_bvoc, confianca_bvoc, exibir_aviso_bvoc)
WHERE t.id = v.tree_id;
