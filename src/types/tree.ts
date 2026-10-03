export interface Arvore {
  id: number;
  foto: string | null;
  nome_cientifico: string;
  nome_popular: string;
  origem: 'Nativa BR' | 'Exótica';
  decidua_perenifolia: 'Perenifólia' | 'Decídua' | 'Semidecídua';
  epoca_floracao: string | null;
  epoca_frutificacao: string | null;
  altura_adulta_max_m: number | null;
  porte_altura_classe: 'Grande' | 'Médio' | 'Pequeno' | null;
  diametro_copa_adulto_max_m: number | null;
  copa_classe: 'Grande' | 'Média' | 'Pequena' | null;
  dap_adulto_max_cm: number | null;
  altura_primeira_bifurcacao_m: number | null;
  // Presentation-only legacy range retained for static fallback records.
  altura_primeira_bifurcacao_faixa?: string;
  forma_copa: string | null;
  faixa_serv_min_m_recomendada: number | null;
  berco_area_min_m2_recomendada: number | null;
  volume_solo_min_m3_recomendado: number | null;
  compat_fiacao: 'N' | 'A' | 'C' | null;
  potencial_dano_calcada_1a5: number | null;
  tolerancia_sol_pleno: boolean | null;
  tolerancia_meia_sombra: boolean | null;
  tolerancia_sombra: boolean | null;
  tolerancia_seca_1a5: number | null;
  tolerancia_encharcamento_1a5: number | null;
  tolerancia_poluicao_atmosferica_1a5: number | null;
  tolerancia_compactacao_solo_1a5: number | null;
  tolerancia_ventos_fortes_1a5: number | null;
  potencial_sujeira_1a5: number | null;
  presenca_espinhos: boolean | null;
  presenca_subst_irritantes: boolean | null;
  atracao_fauna_1a5: number | null;
  tolerancia_poda_1a5: number | null;
  potencial_sombra_1a5: number | null;
  contribuicao_biodiversidade_1a5: number | null;
  ativa?: boolean;
  // Projeção de crescimento em 10 anos (cenário fixo: muda de DAP 3cm / altura 1,5m
  // em boas condições). Opcionais porque nem toda espécie tem projeção — palmeiras
  // não seguem a alometria de DAP — e o fallback estático de src/data/trees.ts não os traz.
  dap_10a_cm?: number | null;
  dap_10a_min_cm?: number | null;
  dap_10a_max_cm?: number | null;
  altura_10a_m?: number | null;
  altura_10a_min_m?: number | null;
  altura_10a_max_m?: number | null;
  biomassa_aerea_10a_kg?: number | null;
  carbono_armazenado_10a_kg?: number | null;
  co2e_10a_kg?: number | null;
  sobrevivencia_10a_pct?: number | null;
  co2e_esperado_por_muda_10a_kg?: number | null;
  // Projeções de crescimento em 20 e 30 anos, ausentes no fallback estático.
  dap_20a_cm?: number | null;
  dap_20a_min_cm?: number | null;
  dap_20a_max_cm?: number | null;
  altura_20a_m?: number | null;
  altura_20a_min_m?: number | null;
  altura_20a_max_m?: number | null;
  dap_30a_cm?: number | null;
  dap_30a_min_cm?: number | null;
  dap_30a_max_cm?: number | null;
  altura_30a_m?: number | null;
  altura_30a_min_m?: number | null;
  altura_30a_max_m?: number | null;
  classe_bvoc?: ClasseBvoc | null;
  evidencia_bvoc?: string | null;
  confianca_bvoc?: ConfiancaBvoc | null;
  exibir_aviso_bvoc?: boolean | null;
}

export type ClasseBvoc = 'baixo' | 'moderado' | 'alto' | 'desconhecido' | 'indeterminado';

export type ConfiancaBvoc = 'baixa' | 'baixa-média' | 'média' | 'média-alta';

export type FiltroAtributo = 'todos' | 'nativas' | 'sem_espinhos';
