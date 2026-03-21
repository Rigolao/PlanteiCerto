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
  altura_primeira_bifurcacao_m: string | null;
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
}

export type FiltroAtributo = 'todos' | 'nativas' | 'sem_espinhos';
