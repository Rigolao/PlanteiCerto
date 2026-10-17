import { describe, expect, it } from 'vitest';
import { staticTrees } from '../data/trees';
import type { Arvore } from '../types/tree';
import {
  getTreeInformationalGaps,
  getTreeQualityIssues,
  summarizeTreeInformation,
  summarizeTreeQuality,
  TREE_INFORMATION_FIELDS,
  TREE_QUALITY_RULES,
} from './treeQuality';

// Campos lidos por evaluateEliminatory (supabase/functions/recommend-trees/rules.ts).
const CAMPOS_ELIMINATORIOS: Array<keyof Arvore> = [
  'faixa_serv_min_m_recomendada',
  'berco_area_min_m2_recomendada',
  'compat_fiacao',
  'copa_classe',
  'porte_altura_classe',
  'potencial_dano_calcada_1a5',
  'tolerancia_sol_pleno',
  'tolerancia_meia_sombra',
  'tolerancia_sombra',
  'tolerancia_seca_1a5',
  'tolerancia_encharcamento_1a5',
  'tolerancia_compactacao_solo_1a5',
  'potencial_sujeira_1a5',
  'presenca_espinhos',
  'presenca_subst_irritantes',
  'atracao_fauna_1a5',
];

// Campos lidos só por calculateScore (pontuação).
const CAMPOS_SO_CLASSIFICATORIOS: Array<keyof Arvore> = [
  'tolerancia_poda_1a5',
  'tolerancia_poluicao_atmosferica_1a5',
  'tolerancia_ventos_fortes_1a5',
  'potencial_sombra_1a5',
  'contribuicao_biodiversidade_1a5',
  'decidua_perenifolia',
  'origem',
];

const TEXTO_ELIMINATORIO = "Vai para 'Requer avaliação técnica' quando a regra se aplica; não pontua.";
const TEXTO_SO_CLASSIFICATORIO = 'Não pontua e aparece como não avaliado.';

function missingBehaviorOf(field: keyof Arvore): string | undefined {
  return TREE_QUALITY_RULES.find((rule) => rule.field === field)?.missingBehavior;
}

function makeCompleteTree(overrides: Partial<Arvore> = {}): Arvore {
  return {
    ...staticTrees[0],
    faixa_serv_min_m_recomendada: 1,
    berco_area_min_m2_recomendada: 1,
    compat_fiacao: 'A',
    copa_classe: 'Pequena',
    porte_altura_classe: 'Pequeno',
    potencial_dano_calcada_1a5: 2,
    tolerancia_sol_pleno: true,
    tolerancia_meia_sombra: true,
    tolerancia_sombra: false,
    tolerancia_seca_1a5: 3,
    tolerancia_encharcamento_1a5: 3,
    tolerancia_compactacao_solo_1a5: 3,
    potencial_sujeira_1a5: 2,
    presenca_espinhos: false,
    presenca_subst_irritantes: false,
    atracao_fauna_1a5: 3,
    tolerancia_poda_1a5: 3,
    tolerancia_poluicao_atmosferica_1a5: 3,
    tolerancia_ventos_fortes_1a5: 3,
    potencial_sombra_1a5: 3,
    contribuicao_biodiversidade_1a5: 3,
    ...overrides,
  };
}

describe('tree quality assessment', () => {
  it('does not report recommendation fields that have values', () => {
    expect(getTreeQualityIssues(makeCompleteTree())).toEqual([]);
  });

  it('reports missing fields with their recommendation impact', () => {
    const issues = getTreeQualityIssues(makeCompleteTree({
      faixa_serv_min_m_recomendada: null,
      tolerancia_poda_1a5: null,
    }));

    expect(issues.map(({ field, impacts }) => ({ field, impacts }))).toEqual([
      { field: 'faixa_serv_min_m_recomendada', impacts: ['eligibility'] },
      { field: 'tolerancia_poda_1a5', impacts: ['ranking'] },
    ]);
  });

  it('keeps species origin and leaf behavior in the recommendation score rules', () => {
    const issues = getTreeQualityIssues(makeCompleteTree({
      origem: '' as Arvore['origem'],
      decidua_perenifolia: null,
    }));

    expect(issues.map(({ field, impacts }) => ({ field, impacts }))).toEqual([
      { field: 'decidua_perenifolia', impacts: ['ranking'] },
      { field: 'origem', impacts: ['ranking'] },
    ]);
  });

  it('reports nullable booleans as unknown, while preserving false as a value', () => {
    const issues = getTreeQualityIssues(makeCompleteTree({
      tolerancia_sombra: null,
      presenca_espinhos: false,
    }));

    expect(issues.map(({ field }) => field)).toEqual(['tolerancia_sombra']);
  });

  it('treats empty and literal null strings as missing', () => {
    const issues = getTreeQualityIssues(makeCompleteTree({
      compat_fiacao: '  ' as Arvore['compat_fiacao'],
      copa_classe: 'NULL' as Arvore['copa_classe'],
    }));

    expect(issues.map(({ field }) => field)).toEqual(['compat_fiacao', 'copa_classe']);
  });

  it('does not classify growth projections as recommendation gaps', () => {
    const issues = getTreeQualityIssues(makeCompleteTree({
      dap_20a_cm: null,
      altura_30a_m: null,
    }));

    expect(issues).toEqual([]);
  });

  it('reports missing complementary information separately from recommendation gaps', () => {
    const tree = makeCompleteTree({ foto: null, epoca_floracao: '  ', dap_20a_cm: null, exibir_aviso_bvoc: false });
    const informationalGaps = getTreeInformationalGaps(tree);

    expect(informationalGaps.map(({ field }) => field)).toEqual(expect.arrayContaining([
      'foto',
      'epoca_floracao',
      'dap_20a_cm',
    ]));
    expect(informationalGaps.map(({ field }) => field)).not.toContain('tolerancia_seca_1a5');
    expect(informationalGaps.map(({ field }) => field)).not.toContain('exibir_aviso_bvoc');
    expect(getTreeQualityIssues(tree)).toEqual([]);
  });

  it('summarizes complementary gaps by field without merging them into score gaps', () => {
    const summary = summarizeTreeInformation([
      makeCompleteTree({ id: 1, foto: null, classe_bvoc: 'baixo' }),
      makeCompleteTree({ id: 2, foto: null, classe_bvoc: null }),
    ]);

    expect(summary.treesWithGaps).toBe(2);
    expect(summary.fields.find(({ field }) => field === 'foto')?.count).toBe(2);
    expect(summary.fields.find(({ field }) => field === 'classe_bvoc')?.count).toBe(1);
    expect(summary.totalGaps).toBeGreaterThanOrEqual(3);
  });

  it('summarizes affected trees, not only the total number of missing fields', () => {
    const trees = [
      makeCompleteTree({ faixa_serv_min_m_recomendada: null }),
      makeCompleteTree({ id: 2, tolerancia_poda_1a5: null }),
      makeCompleteTree({ id: 3 }),
    ];

    expect(summarizeTreeQuality(trees)).toEqual({
      totalTrees: 3,
      totalIssues: 2,
      treesWithEligibilityGaps: 1,
      treesWithRankingGaps: 1,
      treesWithoutMappedGaps: 1,
    });
  });

  it('keeps one rule per recommendation field', () => {
    const fields = TREE_QUALITY_RULES.map(({ field }) => field);
    expect(new Set(fields).size).toBe(fields.length);
    expect(TREE_QUALITY_RULES.every((rule) => rule.expectedFormat && rule.missingBehavior)).toBe(true);
    expect(TREE_QUALITY_RULES.find(({ field }) => field === 'tolerancia_ventos_fortes_1a5')?.questionIds).toContain('q3_5');
    expect(TREE_QUALITY_RULES.find(({ field }) => field === 'potencial_sombra_1a5')?.questionIds).toContain('q3_6');
  });

  it('keeps recommendation and informational field inventories separate', () => {
    const recommendationFields = new Set(TREE_QUALITY_RULES.map(({ field }) => field));
    const informationFields = TREE_INFORMATION_FIELDS.map(({ field }) => field);

    expect(new Set(informationFields).size).toBe(informationFields.length);
    expect(informationFields.some((field) => recommendationFields.has(field))).toBe(false);
  });

  it('describes missing values with the recommender behavior, without old defaults', () => {
    for (const rule of TREE_QUALITY_RULES) {
      expect(rule.missingBehavior, rule.field).not.toMatch(/3\/5|tratado como 0|pontuação neutra|ausência de espinhos/);
    }
  });

  it('uses the approved missing-value text for eliminatory and score-only fields', () => {
    for (const field of CAMPOS_ELIMINATORIOS) {
      expect(missingBehaviorOf(field), field).toBe(TEXTO_ELIMINATORIO);
    }
    for (const field of CAMPOS_SO_CLASSIFICATORIOS) {
      expect(missingBehaviorOf(field), field).toBe(TEXTO_SO_CLASSIFICATORIO);
    }
  });

  it('classifies every recommendation field as eliminatory or score-only', () => {
    const classificados = [...CAMPOS_ELIMINATORIOS, ...CAMPOS_SO_CLASSIFICATORIOS].sort();
    expect(classificados).toEqual(TREE_QUALITY_RULES.map(({ field }) => field).sort());
  });
});
