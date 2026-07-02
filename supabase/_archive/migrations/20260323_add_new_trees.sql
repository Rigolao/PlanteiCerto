-- Migration: Add new trees from Novos_Atributos.xlsx
-- Date: 2026-03-23
-- Adds 18 new tree species (IDs 5-22) to the trees table

INSERT INTO public.trees (
  id,
  foto,
  nome_cientifico,
  nome_popular,
  origem,
  decidua_perenifolia,
  epoca_floracao,
  epoca_frutificacao,
  altura_adulta_max_m,
  porte_altura_classe,
  diametro_copa_adulto_max_m,
  copa_classe,
  dap_adulto_max_cm,
  altura_primeira_bifurcacao_m,
  forma_copa,
  faixa_serv_min_m_recomendada,
  berco_area_min_m2_recomendada,
  volume_solo_min_m3_recomendado,
  compat_fiacao,
  potencial_dano_calcada_1a5,
  tolerancia_sol_pleno,
  tolerancia_meia_sombra,
  tolerancia_sombra,
  tolerancia_seca_1a5,
  tolerancia_encharcamento_1a5,
  tolerancia_poluicao_atmosferica_1a5,
  tolerancia_compactacao_solo_1a5,
  tolerancia_ventos_fortes_1a5,
  potencial_sujeira_1a5,
  presenca_espinhos,
  presenca_subst_irritantes,
  atracao_fauna_1a5,
  tolerancia_poda_1a5,
  potencial_sombra_1a5,
  contribuicao_biodiversidade_1a5
)
VALUES
  (5, NULL, 'Eugenia pyriformis Cambess.', 'Uvaia', 'Nativa BR', 'Perenifólia', 'Set-Nov', 'Out-Fev', 15, 'Pequeno', 7, 'Média', 50, '1,8-2,2', 'Arredondada', 0.7, 1, 0.6, 'C', 2, true, true, true, 3, 4, 3, 2, 3, 4, false, false, 5, 4, 4, 4),

  (6, NULL, 'Albizia niopoides (Spruce ex Benth.) Burkart', 'Farinha-seca', 'Nativa BR', 'Semidecídua', 'Set-Jan', 'Jul-Dez', 35, 'Grande', 20, 'Grande', 80, '4-6', 'Arredondada / Espalhada', 1, 1, 0.6, 'N', 2, true, false, false, 4, 2, 3, 2, 3, 3, false, false, 4, 4, 5, 4),

  (7, NULL, 'Casearia sylvestris Sw.', 'Guaçatonga', 'Nativa BR', 'Semidecídua', 'Mai-Dez', 'Set-Dez', 20, 'Pequeno', 4, 'Pequena', 30, '0,5-1,5', 'Arredondada', 0.7, 1, 0.8, 'C', 3, true, true, false, 4, 4, 3, 3, 3, 2, false, false, 4, 4, 3, 4),

  (8, NULL, 'Luehea divaricata Mart. & Zucc.', 'Açoita-cavalo', 'Nativa BR', 'Decídua', 'Dez-Jul', 'Abr-Out', 30, 'Grande', 8, 'Grande', 100, '1,8-3,0', 'Arredondada', 0.7, 3, 1.8, 'N', 3, true, true, false, 4, 4, 3, 3, 3, 3, false, false, 4, 4, 5, 4),

  (9, NULL, 'Pterocarpus violaceus Vogel', 'Aldrago', 'Nativa BR', 'Perenifólia', 'Out-Dez', 'Mai-Jul', 14, 'Médio', 6, 'Média', 50, '2,0–3,0', 'Espalhada', 1, 1.5, 1.5, 'A', 2, true, true, false, 3, 4, 3, 3, 4, 3, false, false, 4, 4, 4, 4),

  (10, NULL, 'Pterocarpus rohrii Vahl', 'Pau-sangue', 'Nativa BR', 'Semidecídua', 'Out-Mar', 'Jan-Jun', 32, 'Grande', 18, 'Grande', 100, '2,5-3,5', 'Arredondada', 0.8, 3, 1, 'N', 3, true, true, false, 4, 2, 3, 3, 3, 3, false, false, 4, 4, 4, 4),

  (11, NULL, 'Platypodium elegans Vogel', 'Amendoim-do-campo', 'Nativa BR', 'Decídua', 'Set-Out', 'Nov-Jan', 25, 'Grande', 15, 'Grande', 180, '10-15', 'Espalhada', 3, 6, 12, 'N', 4, true, true, false, 3, 2, 3, 2, 3, 3, false, false, NULL, 3, NULL, NULL),

  (12, NULL, 'Ligustrum lucidum W.T. Aiton', 'Ligustro', 'Exótica', 'Perenifólia', 'Out-Jan', 'Jan-Abr', 15, 'Médio', 10, 'Média', 50, '2,0-3,0', 'Globosa', 2, 3, 6, 'A', 3, true, true, true, 4, 2, 3, 3, 3, 4, false, false, 4, 4, 4, 2),

  (13, NULL, 'Holocalyx balansae Micheli', 'Alecrim-de-campinas', 'Nativa BR', 'Semidecídua', 'Fev; Jun-Set', 'Nov; Mar-Abr', 25, 'Grande', 12, 'Grande', 80, '2,5-4,0', 'Globosa', 3, 6, 12, 'N', 4, true, true, true, 2, 2, 3, 3, 3, 3, false, true, 4, 3, 5, 4),

  (14, NULL, 'Hibiscus pernambucensis', 'Guaxima-do-mangue', 'Nativa BR', 'Perenifólia', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (15, NULL, 'Protium heptaphyllum (Aubl.) Marchand', 'Almecegueira', 'Nativa BR', 'Decídua', 'Ago-Set', 'Nov-Dez', 20, 'Médio', 12, 'Média', 60, '2,5-4,0', 'Arredondada', 2, 4, 6, 'A', 3, true, true, false, 3, 4, 3, 3, 3, 3, false, true, 4, 3, 4, 4),

  (16, NULL, 'Helietta apiculata', 'Cun-cun', 'Nativa BR', 'Semidecídua', 'Nov-Dez', 'Mai', 18, 'Médio', NULL, NULL, 50, NULL, NULL, 2, 8, 1, 'A', 2, true, true, false, 4, 2, 3, 3, 3, 2, false, false, 3, 3, 4, 4),

  (17, NULL, 'Psidium cattleianum Sabine', 'Araçá-do-mato', 'Nativa BR', 'Perenifólia', 'Set-Nov', 'Dez-Mar', 6, 'Pequeno', NULL, 'Média', NULL, NULL, 'Espalhada', 1.5, 4, 1, 'C', 2, true, true, false, 3, 3, 3, 3, 3, 4, false, false, 5, 4, 3, 4),

  (18, NULL, 'Andira fraxinifolia', 'Angelim-doce', 'Nativa BR', 'Semidecídua', 'Nov-Dez', 'Fev-Abr', 12, 'Médio', NULL, 'Média', 40, NULL, 'Frondosa', 2.5, 25, 1.5, 'A', 3, true, true, false, 4, 3, 3, 3, 3, 2, false, false, 4, 4, 4, 4),

  (19, NULL, 'Calyptranthes clusiifolia (Miq.) O.Berg', 'Araçarana', 'Nativa BR', 'Perenifólia', NULL, NULL, 15, 'Médio', NULL, 'Média', NULL, NULL, 'Arredondada', 2, 25, 1, 'A', 2, true, true, false, 3, 2, 3, 3, 3, 2, false, false, 4, 4, 4, 4),

  (20, NULL, 'Schinus terebinthifolius', 'Aroeira-vermelha', 'Nativa BR', 'Perenifólia', 'Nov-Jan', 'Dez-Mar', 15, 'Médio', 12, 'Média', 60, '2-4', 'Arredondada', 2, 8, 4, 'C', 3, true, true, false, 4, 2, 4, 3, 3, 4, false, true, 5, 4, 4, 3),

  (21, NULL, 'Dombeya wallichii', 'Astrapéia', 'Exótica', 'Semidecídua', 'Abr-Jul', NULL, 12, 'Médio', NULL, 'Média', NULL, NULL, 'Arredondada', 2, 4, 8, 'C', 2, true, true, false, 3, 2, 3, 2, 3, 3, false, false, 5, 4, 3, 4),

  (22, NULL, 'Machaerium aculeatum', 'Jacarandá-de-espinho', 'Nativa BR', 'Semidecídua', 'Nov-Fev', 'Abr-Jul', 12, 'Médio', NULL, 'Média', 40, NULL, 'Irregular', 2, 4, 2, 'A', 3, true, true, false, 4, 2, 3, 4, 3, 3, true, false, 3, 4, 3, NULL);

-- Update sequence to avoid ID conflicts on future inserts
SELECT setval('trees_id_seq', (SELECT MAX(id) FROM trees));

