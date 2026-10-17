import { describe, expect, it } from 'vitest';
import {
  MAX_SCORE,
  calculateScore,
  evaluateEliminatory,
  type Answers,
  type Tree,
} from './rules.ts';

// Espécie com todos os campos preenchidos e válidos: passa em todas as regras usadas nos testes.
function tree(overrides: Partial<Tree> = {}): Tree {
  return {
    id: 1,
    foto: null,
    nome_cientifico: 'Species exemplum',
    nome_popular: 'Árvore exemplo',
    origem: 'Nativa BR',
    decidua_perenifolia: 'Perenifólia',
    epoca_floracao: 'Set-Out',
    epoca_frutificacao: 'Nov-Dez',
    altura_adulta_max_m: 6,
    porte_altura_classe: 'Pequeno',
    diametro_copa_adulto_max_m: 4,
    copa_classe: 'Pequena',
    dap_adulto_max_cm: 30,
    altura_primeira_bifurcacao_m: '1,8',
    forma_copa: 'Arredondada',
    faixa_serv_min_m_recomendada: 0.5,
    berco_area_min_m2_recomendada: 0.5,
    volume_solo_min_m3_recomendado: 1,
    compat_fiacao: 'C',
    potencial_dano_calcada_1a5: 2,
    tolerancia_sol_pleno: true,
    tolerancia_meia_sombra: true,
    tolerancia_sombra: true,
    tolerancia_seca_1a5: 4,
    tolerancia_encharcamento_1a5: 4,
    tolerancia_poluicao_atmosferica_1a5: 4,
    tolerancia_compactacao_solo_1a5: 4,
    tolerancia_ventos_fortes_1a5: 4,
    potencial_sujeira_1a5: 2,
    presenca_espinhos: false,
    presenca_subst_irritantes: false,
    atracao_fauna_1a5: 3,
    tolerancia_poda_1a5: 4,
    potencial_sombra_1a5: 4,
    contribuicao_biodiversidade_1a5: 4,
    ativa: true,
    ...overrides,
  };
}

const NENHUM_ESTIMADO = new Set<string>();

// ── Oráculos ──
// Cópias literais de supabase/functions/recommend-trees/index.ts @ 6556cfb (antes da Task 6),
// só com os nomes trocados. Servem para provar que, numa árvore sem NULL, as regras e a
// pontuação continuam idênticas. Os `?? 3` / `?? 0` abaixo são o comportamento ANTIGO
// congelado para comparação; não editar.

function oracleRangeUpperBound(value: string): number {
  switch (value) {
    case 'lt_1': return 1.0;
    case '1_2': return 2.0;
    case '2_3': return 3.0;
    case '3_4': return 4.0;
    case 'gt_4': return 99;
    case 'gt_2': return 99;
    default: return 99;
  }
}

function oraclePasses(tree: Tree, answers: Answers): boolean {
  // ── Grupo 2: Espaço físico ──

  if (answers.q2_2) {
    const available = oracleRangeUpperBound(answers.q2_2);
    if (tree.faixa_serv_min_m_recomendada != null && tree.faixa_serv_min_m_recomendada > available) return false;
  }
  if (answers.q2_3 === 'sim' && answers.q2_1) {
    const effectiveWidth = oracleRangeUpperBound(answers.q2_1) - 1.20;
    if (tree.faixa_serv_min_m_recomendada != null && tree.faixa_serv_min_m_recomendada > effectiveWidth) return false;
  }
  if (answers.q2_4) {
    const available = oracleRangeUpperBound(answers.q2_4);
    if (tree.berco_area_min_m2_recomendada != null && tree.berco_area_min_m2_recomendada > available) return false;
  }
  if (answers.q2_5 && answers.q2_5 !== 'nao') {
    if (answers.q2_5 === 'sim_convencional' && answers.q2_6 === 'lt_4') {
      if (tree.compat_fiacao === 'N') return false;
    } else if (answers.q2_5 === 'sim_protegida' || answers.q2_6 === 'gt_4') {
      if (tree.compat_fiacao === 'N' && tree.porte_altura_classe === 'Grande') return false;
    }
  }
  if (answers.q2_7 === 'nenhum' || answers.q2_7 === 'lt_2') {
    if (tree.copa_classe === 'Grande') return false;
  }
  if (answers.q2_8a === 'lt_6') {
    if (tree.porte_altura_classe === 'Grande') return false;
  }
  if (answers.q2_8b === 'lt_4') {
    if (tree.copa_classe === 'Grande') return false;
  }
  // q2_8c: guia rebaixada < 1,5m — elimina qualquer árvore (NBR 9050)
  if (answers.q2_8c === 'lt_1_5') return false;
  // q2_8d: boca-de-lobo < 1,5m — elimina árvores com alto potencial de dano à calçada
  if (answers.q2_8d === 'lt_1_5') {
    if ((tree.potencial_dano_calcada_1a5 ?? 0) >= 4) return false;
  }

  // ── Grupo 3: Condições ecológicas (eliminatório conforme planilha) ──

  if (answers.q3_1 === 'sol_pleno' && tree.tolerancia_sol_pleno === false) return false;
  if (answers.q3_1 === 'meia_sombra' && tree.tolerancia_meia_sombra === false) return false;
  if (answers.q3_1 === 'sombra' && tree.tolerancia_sombra === false) return false;

  if (answers.q3_2 === 'seco') {
    if (tree.tolerancia_seca_1a5 != null && tree.tolerancia_seca_1a5 <= 2) return false;
  }
  if (answers.q3_2 === 'encharcado') {
    if (tree.tolerancia_encharcamento_1a5 != null && tree.tolerancia_encharcamento_1a5 <= 3) return false;
  }
  if (answers.q3_3 === 'ruim') {
    if (tree.tolerancia_compactacao_solo_1a5 != null && tree.tolerancia_compactacao_solo_1a5 <= 3) return false;
  }
  if (answers.q3_4 === 'nao') {
    if (tree.tolerancia_seca_1a5 != null && tree.tolerancia_seca_1a5 <= 2) return false;
  }

  // ── Grupo 4: Preferências (eliminatório conforme planilha) ──

  if (answers.q4_1 === 'sim') {
    if (tree.potencial_sujeira_1a5 != null && tree.potencial_sujeira_1a5 >= 3) return false;
  }
  if (answers.q4_2 === 'sim') {
    if (tree.presenca_espinhos === true || tree.presenca_subst_irritantes === true) return false;
  }
  if (answers.q4_3 === 'sim') {
    if (tree.atracao_fauna_1a5 != null && tree.atracao_fauna_1a5 >= 4) return false;
  }

  return true;
}

// MAX_SCORE = 120 (G2+G3) + 10 (Q4.1) + 20 (Q4.2) + 10 (Q5.1) + 10 (Q5.2) + 10 (Q6.1) + 10 (Q6.2) = 190
const ORACLE_MAX_SCORE = 190;

interface OracleCriterion {
  label: string;
  points: number;
  maxPoints: number;
}

function oracleScore(tree: Tree, answers: Answers): { score: number; breakdown: OracleCriterion[] } {
  let raw = 0;
  const breakdown: OracleCriterion[] = [];

  // ── Grupo 3: Ecológico ──

  // Q3.1 — Insolação (max 20)
  if (answers.q3_1) {
    let pts = 0;
    let label = '';
    if (answers.q3_1 === 'sol_pleno') {
      pts = tree.tolerancia_sol_pleno === true ? 20 : tree.tolerancia_sol_pleno === false ? 0 : 10;
      label = 'Insolação (sol pleno)';
    } else if (answers.q3_1 === 'meia_sombra') {
      pts = tree.tolerancia_meia_sombra === true ? 20 : tree.tolerancia_meia_sombra === false ? 0 : 10;
      label = 'Insolação (meia sombra)';
    } else if (answers.q3_1 === 'sombra') {
      pts = tree.tolerancia_sombra === true ? 20 : tree.tolerancia_sombra === false ? 0 : 10;
      label = 'Insolação (sombra)';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 20 });
  }

  // Q3.2 — Umidade do solo (max 20)
  if (answers.q3_2) {
    let pts = 0;
    let label = '';
    if (answers.q3_2 === 'seco') {
      pts = (tree.tolerancia_seca_1a5 ?? 3) * 4;
      label = 'Tolerância à seca';
    } else if (answers.q3_2 === 'umido') {
      pts = 15;
      label = 'Umidade do solo';
    } else if (answers.q3_2 === 'encharcado') {
      pts = (tree.tolerancia_encharcamento_1a5 ?? 3) * 4;
      label = 'Tolerância a encharcamento';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 20 });
  }

  // Q3.3 — Qualidade do solo (max 20)
  if (answers.q3_3) {
    let pts = 0;
    let label = '';
    if (answers.q3_3 === 'ruim') {
      pts = (tree.tolerancia_compactacao_solo_1a5 ?? 3) * 4;
      label = 'Solo compactado/aterro';
    } else {
      pts = 20;
      label = 'Qualidade do solo';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 20 });
  }

  // Q3.4 — Irrigação (max 10)
  if (answers.q3_4) {
    let pts = 0;
    let label = '';
    if (answers.q3_4 === 'nao') {
      pts = (tree.tolerancia_seca_1a5 ?? 3) * 2;
      label = 'Sem irrigação disponível';
    } else {
      pts = 10;
      label = 'Irrigação disponível';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // ── Grupo 4: Preferências ──

  // Q4.1 — Sujeira (max 15)
  if (answers.q4_1) {
    let pts = 0;
    let label = '';
    if (answers.q4_1 === 'sim') {
      pts = (6 - (tree.potencial_sujeira_1a5 ?? 3)) * 3;
      label = 'Potencial de sujeira';
    } else {
      pts = 15;
      label = 'Queda de folhas/frutos';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 15 });
  }

  // Q4.2 — Espinhos/irritantes (max 15)
  if (answers.q4_2) {
    let pts = 0;
    let label = '';
    if (answers.q4_2 === 'sim') {
      const semEspinhos = tree.presenca_espinhos === false || tree.presenca_espinhos == null;
      const semIrritantes = tree.presenca_subst_irritantes === false || tree.presenca_subst_irritantes == null;
      if (semEspinhos && semIrritantes) {
        pts = 15; label = 'Sem espinhos/irritantes';
      } else if (semEspinhos || semIrritantes) {
        pts = 7; label = 'Espinhos/irritantes (parcial)';
      } else {
        pts = 0; label = 'Presença de espinhos/irritantes';
      }
    } else {
      pts = 15; label = 'Espinhos/irritantes';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 15 });
  }

  // Q4.3 — Atração de insetos (max 10)
  if (answers.q4_3) {
    let pts = 0;
    let label = '';
    if (answers.q4_3 === 'sim') {
      pts = (6 - (tree.atracao_fauna_1a5 ?? 3)) * 2;
      label = 'Atração de insetos/abelhas';
    } else {
      pts = 10; label = 'Atração de fauna';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // Q4.4 — Poda (max 10)
  if (answers.q4_4) {
    let pts = 0;
    let label = '';
    if (answers.q4_4 === 'nao') {
      pts = (tree.tolerancia_poda_1a5 ?? 3) * 2;
      label = 'Tolerância a poda mínima';
    } else {
      pts = 10; label = 'Manutenção profissional';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // ── Grupo 1: Contexto ──

  // Q1.1 — Tipo de local (max 10)
  if (answers.q1_1) {
    let pts = 0;
    let label = '';
    if (answers.q1_1 === 'calcada') {
      pts = (6 - (tree.potencial_dano_calcada_1a5 ?? 3)) * 2;
      label = 'Adequação à calçada';
    } else if (answers.q1_1 === 'canteiro_central') {
      pts = (tree.tolerancia_poluicao_atmosferica_1a5 ?? 3) * 2;
      label = 'Tolerância à poluição (canteiro)';
    } else if (answers.q1_1 === 'praca_parque') {
      pts = (tree.atracao_fauna_1a5 ?? 3) * 2;
      label = 'Contribuição ecológica (praça)';
    } else if (answers.q1_1 === 'rotatorio') {
      pts = (tree.tolerancia_ventos_fortes_1a5 ?? 3) * 2;
      label = 'Tolerância a ventos (rotatória)';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // Q1.2 — Objetivo(s) principal(is) (max 20, multi-select)
  if (answers.q1_2) {
    const objectives = answers.q1_2.split(',').filter(Boolean);
    const quota = 20 / objectives.length;
    let totalPts = 0;

    for (const obj of objectives) {
      if (obj === 'sombra') {
        totalPts += ((tree.potencial_sombra_1a5 ?? 3) / 5) * quota;
      } else if (obj === 'embelezamento') {
        // Proxy: atracao_fauna (espécies com boa floração tendem a atrair fauna)
        totalPts += ((tree.atracao_fauna_1a5 ?? 3) / 5) * quota;
      } else if (obj === 'fauna') {
        totalPts += ((tree.atracao_fauna_1a5 ?? 3) / 5) * quota;
      } else if (obj === 'baixa_manutencao') {
        if (tree.decidua_perenifolia === 'Perenifólia') {
          totalPts += quota;
        } else {
          totalPts += ((6 - (tree.potencial_sujeira_1a5 ?? 3)) / 5) * quota;
        }
      } else if (obj === 'qualidade_ar') {
        totalPts += ((tree.contribuicao_biodiversidade_1a5 ?? 3) / 5) * quota;
      } else if (obj === 'nativas') {
        totalPts += tree.origem === 'Nativa BR' ? quota : 0;
      }
    }

    const pts = Math.round(totalPts);
    raw += pts;
    breakdown.push({ label: 'Objetivo(s) de plantio', points: pts, maxPoints: 20 });
  }

  // ── Grupo 5 ──

  // Q5.1 — Preferência por nativas (max 10)
  if (answers.q5_1) {
    let pts = 0;
    let label = '';
    if (answers.q5_1 === 'sim') {
      pts = tree.origem === 'Nativa BR' ? 10 : 0;
      label = 'Espécie nativa';
    } else {
      pts = 10; label = 'Origem da espécie';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // Q5.2 — Preferência por fauna (max 10)
  if (answers.q5_2) {
    let pts = 0;
    let label = '';
    if (answers.q5_2 === 'sim') {
      pts = (tree.atracao_fauna_1a5 ?? 3) * 2;
      label = 'Atração de fauna (preferência)';
    } else {
      pts = 10; label = 'Atração de fauna';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // Q3.5 — Ventos fortes (max 10)
  if (answers.q3_5) {
    let pts = 0;
    let label = '';
    if (answers.q3_5 === 'sim') {
      pts = (tree.tolerancia_ventos_fortes_1a5 ?? 3) * 2;
      label = 'Tolerância a ventos fortes';
    } else {
      pts = 10; label = 'Exposição ao vento';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // Q3.6 — Ilha de calor (max 10)
  if (answers.q3_6) {
    let pts = 0;
    let label = '';
    if (answers.q3_6 === 'sim') {
      pts = (tree.potencial_sombra_1a5 ?? 3) * 2;
      label = 'Potencial de sombra (ilha de calor)';
    } else {
      pts = 10; label = 'Potencial de sombra';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  return { score: Math.round((raw / ORACLE_MAX_SCORE) * 100), breakdown };
}

// ── Eliminatórias ──

describe('evaluateEliminatory — fiação convencional baixa', () => {
  const answers: Answers = { q2_5: 'sim_convencional', q2_6: 'lt_4' };

  it("compat='N' → eliminada", () => {
    expect(evaluateEliminatory(tree({ compat_fiacao: 'N' }), answers).status).toBe('eliminada');
  });

  it('compat=null → requer_avaliacao com a pendência de fiação', () => {
    expect(evaluateEliminatory(tree({ compat_fiacao: null }), answers)).toEqual({
      status: 'requer_avaliacao',
      pendencias: ['Compatibilidade com fiação: não avaliado'],
    });
  });

  it("compat='C' → aprovada", () => {
    expect(evaluateEliminatory(tree({ compat_fiacao: 'C' }), answers)).toEqual({
      status: 'aprovada',
      pendencias: [],
    });
  });
});

describe('evaluateEliminatory — fiação protegida (Review Focus 4)', () => {
  const gatilhos: [string, Answers][] = [
    ["q2_5='sim_protegida'", { q2_5: 'sim_protegida' }],
    ["q2_6='gt_4'", { q2_5: 'sim_convencional', q2_6: 'gt_4' }],
  ];

  describe.each(gatilhos)('%s', (_nome, answers) => {
    it("compat='N' + porte='Grande' → eliminada", () => {
      const r = evaluateEliminatory(tree({ compat_fiacao: 'N', porte_altura_classe: 'Grande' }), answers);
      expect(r.status).toBe('eliminada');
    });

    it("compat=null + porte='Grande' → requer_avaliacao (fiação)", () => {
      const r = evaluateEliminatory(tree({ compat_fiacao: null, porte_altura_classe: 'Grande' }), answers);
      expect(r).toEqual({ status: 'requer_avaliacao', pendencias: ['Compatibilidade com fiação: não avaliado'] });
    });

    it("compat='N' + porte=null → requer_avaliacao (porte)", () => {
      const r = evaluateEliminatory(tree({ compat_fiacao: 'N', porte_altura_classe: null }), answers);
      expect(r).toEqual({ status: 'requer_avaliacao', pendencias: ['Porte: não avaliado'] });
    });

    it("compat='C' + porte=null → aprovada (a regra não depende do porte)", () => {
      const r = evaluateEliminatory(tree({ compat_fiacao: 'C', porte_altura_classe: null }), answers);
      expect(r).toEqual({ status: 'aprovada', pendencias: [] });
    });
  });
});

describe('evaluateEliminatory — violação conhecida prevalece (Review Focus 3)', () => {
  it("compat='N' + espinhos=null com q4_2='sim' → eliminada", () => {
    const r = evaluateEliminatory(
      tree({ compat_fiacao: 'N', presenca_espinhos: null }),
      { q2_5: 'sim_convencional', q2_6: 'lt_4', q4_2: 'sim' },
    );
    expect(r.status).toBe('eliminada');
  });

  it('espinhos=true + irritantes=null → eliminada', () => {
    const r = evaluateEliminatory(
      tree({ presenca_espinhos: true, presenca_subst_irritantes: null }),
      { q4_2: 'sim' },
    );
    expect(r.status).toBe('eliminada');
  });
});

describe("evaluateEliminatory — q4_2='sim' (espinhos/irritantes)", () => {
  const answers: Answers = { q4_2: 'sim' };

  it('espinhos=true → eliminada', () => {
    expect(evaluateEliminatory(tree({ presenca_espinhos: true }), answers).status).toBe('eliminada');
  });

  it('espinhos=null → pendência de espinhos', () => {
    expect(evaluateEliminatory(tree({ presenca_espinhos: null }), answers)).toEqual({
      status: 'requer_avaliacao',
      pendencias: ['Presença de espinhos: não avaliado'],
    });
  });

  it('irritantes=null → pendência própria', () => {
    expect(evaluateEliminatory(tree({ presenca_subst_irritantes: null }), answers)).toEqual({
      status: 'requer_avaliacao',
      pendencias: ['Presença de substâncias irritantes: não avaliado'],
    });
  });
});

describe('evaluateEliminatory — demais critérios com NULL', () => {
  it("luz q3_1='sombra' com tolerancia_sombra=null → pendência", () => {
    expect(evaluateEliminatory(tree({ tolerancia_sombra: null }), { q3_1: 'sombra' })).toEqual({
      status: 'requer_avaliacao',
      pendencias: ['Tolerância a sombra: não avaliado'],
    });
  });

  it("boca-de-lobo q2_8d='lt_1_5' com dano=null → pendência (antes passava como 0)", () => {
    expect(evaluateEliminatory(tree({ potencial_dano_calcada_1a5: null }), { q2_8d: 'lt_1_5' })).toEqual({
      status: 'requer_avaliacao',
      pendencias: ['Potencial de dano à calçada: não avaliado'],
    });
  });

  it("seca exigida por q3_2='seco' e q3_4='nao' gera uma pendência só", () => {
    expect(
      evaluateEliminatory(tree({ tolerancia_seca_1a5: null }), { q3_2: 'seco', q3_4: 'nao' }),
    ).toEqual({ status: 'requer_avaliacao', pendencias: ['Tolerância à seca: não avaliado'] });
  });

  it('pendências seguem a ordem das regras', () => {
    const r = evaluateEliminatory(
      tree({ faixa_serv_min_m_recomendada: null, berco_area_min_m2_recomendada: null, atracao_fauna_1a5: null }),
      { q4_3: 'sim', q2_4: 'lt_1', q2_2: 'lt_1' },
    );
    expect(r.pendencias).toEqual([
      'Faixa de serviço mínima: não avaliado',
      'Área mínima de berço: não avaliado',
      'Atração de fauna: não avaliado',
    ]);
  });

  it("guia rebaixada q2_8c='lt_1_5' continua eliminando todas", () => {
    expect(evaluateEliminatory(tree(), { q2_8c: 'lt_1_5' }).status).toBe('eliminada');
  });

  it('cenário Luehea grandiflora em calçada estreita com fiação convencional → requer_avaliacao', () => {
    const luehea = tree({
      id: 217,
      nome_cientifico: 'Luehea grandiflora',
      porte_altura_classe: null,
      copa_classe: null,
      compat_fiacao: null,
      presenca_espinhos: null,
      presenca_subst_irritantes: null,
      potencial_dano_calcada_1a5: 3,
      tolerancia_seca_1a5: 3,
      tolerancia_encharcamento_1a5: 3,
      tolerancia_poluicao_atmosferica_1a5: 3,
      tolerancia_compactacao_solo_1a5: 3,
      tolerancia_ventos_fortes_1a5: 3,
      potencial_sujeira_1a5: 3,
      atracao_fauna_1a5: 3,
      tolerancia_poda_1a5: 3,
      potencial_sombra_1a5: 3,
      contribuicao_biodiversidade_1a5: 3,
    });
    const calcadaEstreita: Answers = {
      q1_1: 'calcada',
      q2_1: '1_2',
      q2_2: '1_2',
      q2_3: 'sim',
      q2_4: '1_2',
      q2_5: 'sim_convencional',
      q2_6: 'lt_4',
      q2_7: 'lt_2',
    };
    const r = evaluateEliminatory(luehea, calcadaEstreita);
    expect(r.status).not.toBe('aprovada');
    expect(r).toEqual({
      status: 'requer_avaliacao',
      pendencias: ['Compatibilidade com fiação: não avaliado', 'Classe de copa: não avaliado'],
    });
  });
});

// ── Pontuação ──

describe('calculateScore — NULL vale 0 e fica "não avaliado"', () => {
  const seco: Answers = { q3_2: 'seco' };

  it("q3_2='seco' com seca=null → 0 ponto, nao_avaliado, rótulo com sufixo", () => {
    const { breakdown } = calculateScore(tree({ tolerancia_seca_1a5: null }), seco, NENHUM_ESTIMADO);
    expect(breakdown).toEqual([
      {
        label: 'Tolerância à seca (não avaliado)',
        points: 0,
        maxPoints: 20,
        campo: 'tolerancia_seca_1a5',
        status: 'nao_avaliado',
      },
    ]);
  });

  it('seca=3 estimada → 12 pontos, status estimado', () => {
    const { breakdown } = calculateScore(
      tree({ id: 217, tolerancia_seca_1a5: 3 }),
      seco,
      new Set(['217:tolerancia_seca_1a5']),
    );
    expect(breakdown[0]).toEqual({
      label: 'Tolerância à seca',
      points: 12,
      maxPoints: 20,
      campo: 'tolerancia_seca_1a5',
      status: 'estimado',
    });
  });

  it('seca=3 fora de estimados → status avaliado', () => {
    const { breakdown } = calculateScore(tree({ id: 217, tolerancia_seca_1a5: 3 }), seco, NENHUM_ESTIMADO);
    expect(breakdown[0]).toMatchObject({ points: 12, status: 'avaliado' });
  });

  it('estimativa de outra espécie não contamina', () => {
    const { breakdown } = calculateScore(
      tree({ id: 217, tolerancia_seca_1a5: 3 }),
      seco,
      new Set(['218:tolerancia_seca_1a5']),
    );
    expect(breakdown[0].status).toBe('avaliado');
  });

  it("q3_1='sol_pleno' com tolerância=null → 0 ponto (antes 10)", () => {
    const { breakdown } = calculateScore(tree({ tolerancia_sol_pleno: null }), { q3_1: 'sol_pleno' }, NENHUM_ESTIMADO);
    expect(breakdown).toEqual([
      {
        label: 'Insolação (sol pleno) (não avaliado)',
        points: 0,
        maxPoints: 20,
        campo: 'tolerancia_sol_pleno',
        status: 'nao_avaliado',
      },
    ]);
  });

  it('item que não depende de campo da espécie fica avaliado e sem campo', () => {
    const { breakdown } = calculateScore(tree(), { q3_4: 'sim', q3_2: 'umido' }, NENHUM_ESTIMADO);
    expect(breakdown).toEqual([
      { label: 'Umidade do solo', points: 15, maxPoints: 20, status: 'avaliado' },
      { label: 'Irrigação disponível', points: 10, maxPoints: 10, status: 'avaliado' },
    ]);
  });

  it('score continua sobre MAX_SCORE 190', () => {
    expect(MAX_SCORE).toBe(190);
    // seca 4 → 16 pontos; round(16 / 190 * 100) = 8
    expect(calculateScore(tree(), seco, NENHUM_ESTIMADO).score).toBe(8);
    expect(calculateScore(tree({ tolerancia_seca_1a5: null }), seco, NENHUM_ESTIMADO).score).toBe(0);
  });
});

describe("calculateScore — q4_2='sim' conta só false explícito", () => {
  const answers: Answers = { q4_2: 'sim' };

  it('espinhos e irritantes null → 0 ponto (antes 15), nao_avaliado', () => {
    const { breakdown } = calculateScore(
      tree({ presenca_espinhos: null, presenca_subst_irritantes: null }),
      answers,
      NENHUM_ESTIMADO,
    );
    expect(breakdown).toEqual([
      { label: 'Espinhos/irritantes (não avaliado)', points: 0, maxPoints: 15, status: 'nao_avaliado' },
    ]);
  });

  it('um null e outro false → 7 pontos, avaliado', () => {
    const { breakdown } = calculateScore(tree({ presenca_espinhos: null }), answers, NENHUM_ESTIMADO);
    expect(breakdown).toEqual([
      { label: 'Espinhos/irritantes (parcial)', points: 7, maxPoints: 15, status: 'avaliado' },
    ]);
  });

  it('um null e outro true → 0 ponto, avaliado', () => {
    const { breakdown } = calculateScore(
      tree({ presenca_espinhos: true, presenca_subst_irritantes: null }),
      answers,
      NENHUM_ESTIMADO,
    );
    expect(breakdown[0]).toMatchObject({ points: 0, status: 'avaliado' });
  });

  it('campo não nulo estimado → estimado', () => {
    const { breakdown } = calculateScore(
      tree({ id: 9, presenca_espinhos: null }),
      answers,
      new Set(['9:presenca_subst_irritantes']),
    );
    expect(breakdown[0]).toMatchObject({ points: 7, status: 'estimado' });
  });
});

describe('calculateScore — objetivos múltiplos (q1_2)', () => {
  it('cota com campo NULL soma 0; item segue avaliado se alguma cota tem valor', () => {
    const { breakdown } = calculateScore(
      tree({ potencial_sombra_1a5: null, atracao_fauna_1a5: 5 }),
      { q1_2: 'sombra,fauna' },
      NENHUM_ESTIMADO,
    );
    expect(breakdown).toEqual([
      { label: 'Objetivo(s) de plantio', points: 10, maxPoints: 20, status: 'avaliado' },
    ]);
  });

  it('todas as cotas NULL → 0 ponto, nao_avaliado', () => {
    const { breakdown } = calculateScore(
      tree({ potencial_sombra_1a5: null, atracao_fauna_1a5: null }),
      { q1_2: 'sombra,fauna' },
      NENHUM_ESTIMADO,
    );
    expect(breakdown).toEqual([
      { label: 'Objetivo(s) de plantio (não avaliado)', points: 0, maxPoints: 20, status: 'nao_avaliado' },
    ]);
  });

  it('alguma cota com campo estimado → estimado', () => {
    const { breakdown } = calculateScore(
      tree({ id: 5, potencial_sombra_1a5: null, atracao_fauna_1a5: 5 }),
      { q1_2: 'sombra,fauna' },
      new Set(['5:atracao_fauna_1a5']),
    );
    expect(breakdown[0]).toMatchObject({ points: 10, status: 'estimado' });
  });

  it("baixa_manutencao: 'Perenifólia' vale a cota inteira mesmo com sujeira NULL", () => {
    const { breakdown } = calculateScore(
      tree({ decidua_perenifolia: 'Perenifólia', potencial_sujeira_1a5: null }),
      { q1_2: 'baixa_manutencao' },
      NENHUM_ESTIMADO,
    );
    expect(breakdown[0]).toMatchObject({ label: 'Objetivo(s) de plantio', points: 20, status: 'avaliado' });
  });

  it('baixa_manutencao: não perenifólia usa a fórmula de sujeira', () => {
    const { breakdown } = calculateScore(
      tree({ decidua_perenifolia: 'Decídua', potencial_sujeira_1a5: 1 }),
      { q1_2: 'baixa_manutencao' },
      NENHUM_ESTIMADO,
    );
    expect(breakdown[0]).toMatchObject({ points: 20, status: 'avaliado' });
  });

  it('baixa_manutencao: não perenifólia com sujeira NULL → cota 0, nao_avaliado', () => {
    const { breakdown } = calculateScore(
      tree({ decidua_perenifolia: 'Decídua', potencial_sujeira_1a5: null }),
      { q1_2: 'baixa_manutencao' },
      NENHUM_ESTIMADO,
    );
    expect(breakdown[0]).toEqual({
      label: 'Objetivo(s) de plantio (não avaliado)',
      points: 0,
      maxPoints: 20,
      status: 'nao_avaliado',
    });
  });
});

// ── Oráculo: árvore sem NULL ──

const arvoresCompletas: Tree[] = [
  tree(),
  tree({
    id: 2,
    origem: 'Exótica',
    decidua_perenifolia: 'Decídua',
    porte_altura_classe: 'Grande',
    copa_classe: 'Grande',
    compat_fiacao: 'N',
    faixa_serv_min_m_recomendada: 2.5,
    berco_area_min_m2_recomendada: 3,
    potencial_dano_calcada_1a5: 5,
    tolerancia_sol_pleno: false,
    tolerancia_meia_sombra: true,
    tolerancia_sombra: false,
    tolerancia_seca_1a5: 1,
    tolerancia_encharcamento_1a5: 5,
    tolerancia_poluicao_atmosferica_1a5: 2,
    tolerancia_compactacao_solo_1a5: 3,
    tolerancia_ventos_fortes_1a5: 1,
    potencial_sujeira_1a5: 4,
    presenca_espinhos: true,
    presenca_subst_irritantes: false,
    atracao_fauna_1a5: 5,
    tolerancia_poda_1a5: 1,
    potencial_sombra_1a5: 5,
    contribuicao_biodiversidade_1a5: 2,
  }),
  tree({
    id: 3,
    decidua_perenifolia: 'Semidecídua',
    porte_altura_classe: 'Médio',
    copa_classe: 'Média',
    compat_fiacao: 'A',
    faixa_serv_min_m_recomendada: 1.5,
    berco_area_min_m2_recomendada: 1.5,
    potencial_dano_calcada_1a5: 3,
    tolerancia_sol_pleno: true,
    tolerancia_meia_sombra: false,
    tolerancia_sombra: true,
    tolerancia_seca_1a5: 2,
    tolerancia_encharcamento_1a5: 3,
    tolerancia_poluicao_atmosferica_1a5: 5,
    tolerancia_compactacao_solo_1a5: 5,
    tolerancia_ventos_fortes_1a5: 3,
    potencial_sujeira_1a5: 3,
    presenca_espinhos: true,
    presenca_subst_irritantes: true,
    atracao_fauna_1a5: 4,
    tolerancia_poda_1a5: 2,
    potencial_sombra_1a5: 1,
    contribuicao_biodiversidade_1a5: 5,
  }),
];

describe('oráculo — pontuação de árvore completa idêntica à função anterior', () => {
  const combinacoes: [string, Answers][] = [
    [
      'restritivas',
      {
        q1_1: 'calcada',
        q1_2: 'sombra,fauna,baixa_manutencao',
        q3_1: 'sol_pleno',
        q3_2: 'seco',
        q3_3: 'ruim',
        q3_4: 'nao',
        q3_5: 'sim',
        q3_6: 'sim',
        q4_1: 'sim',
        q4_2: 'sim',
        q4_3: 'sim',
        q4_4: 'nao',
        q5_1: 'sim',
        q5_2: 'sim',
      },
    ],
    [
      'permissivas',
      {
        q1_1: 'canteiro_central',
        q1_2: 'embelezamento,qualidade_ar,nativas',
        q3_1: 'meia_sombra',
        q3_2: 'encharcado',
        q3_3: 'bom',
        q3_4: 'sim',
        q3_5: 'nao',
        q3_6: 'nao',
        q4_1: 'nao',
        q4_2: 'nao',
        q4_3: 'nao',
        q4_4: 'sim',
        q5_1: 'nao',
        q5_2: 'nao',
      },
    ],
    [
      'mistas',
      {
        q1_1: 'praca_parque',
        q1_2: 'baixa_manutencao,sombra,qualidade_ar',
        q3_1: 'sombra',
        q3_2: 'umido',
        q3_3: 'ruim',
        q3_4: 'nao',
        q4_1: 'sim',
        q4_2: 'sim',
        q4_4: 'nao',
        q5_1: 'sim',
        q3_6: 'sim',
      },
    ],
    [
      'rotatória',
      { q1_1: 'rotatorio', q1_2: 'nativas,fauna', q3_5: 'sim', q4_3: 'sim', q5_2: 'sim' },
    ],
  ];

  const casos = combinacoes.flatMap(([nome, answers]) =>
    arvoresCompletas.map((t) => [`${nome} × árvore ${t.id}`, t, answers] as const),
  );

  it.each(casos)('%s', (_nome, t, answers) => {
    const esperado = oracleScore(t, answers);
    const obtido = calculateScore(t, answers, NENHUM_ESTIMADO);

    expect(obtido.score).toBe(esperado.score);
    expect(obtido.breakdown.map(({ label, points, maxPoints }) => ({ label, points, maxPoints }))).toEqual(
      esperado.breakdown,
    );
    expect(obtido.breakdown.every((c) => c.status === 'avaliado')).toBe(true);
  });
});

describe('oráculo — eliminatórias de árvore completa idênticas à função anterior', () => {
  const combinacoes: [string, Answers][] = [
    [
      'todas as regras',
      {
        q2_1: '2_3',
        q2_2: '1_2',
        q2_3: 'sim',
        q2_4: '1_2',
        q2_5: 'sim_convencional',
        q2_6: 'lt_4',
        q2_7: 'lt_2',
        q2_8a: 'lt_6',
        q2_8b: 'lt_4',
        q2_8d: 'lt_1_5',
        q3_1: 'sol_pleno',
        q3_2: 'seco',
        q3_3: 'ruim',
        q3_4: 'nao',
        q4_1: 'sim',
        q4_2: 'sim',
        q4_3: 'sim',
      },
    ],
    [
      'fiação protegida',
      { q2_2: 'gt_4', q2_5: 'sim_protegida', q2_7: 'nenhum', q3_1: 'meia_sombra', q3_2: 'encharcado' },
    ],
    ['fiação alta', { q2_4: 'gt_2', q2_5: 'sim_convencional', q2_6: 'gt_4', q3_1: 'sombra' }],
    ['guia rebaixada', { q2_8c: 'lt_1_5' }],
    ['sem restrição', {}],
  ];

  const casos = combinacoes.flatMap(([nome, answers]) =>
    arvoresCompletas.map((t) => [`${nome} × árvore ${t.id}`, t, answers] as const),
  );

  it.each(casos)('%s', (_nome, t, answers) => {
    const r = evaluateEliminatory(t, answers);
    expect(r.pendencias).toEqual([]);
    expect(r.status).toBe(oraclePasses(t, answers) ? 'aprovada' : 'eliminada');
  });

  it('as combinações aprovam e eliminam (o oráculo não é trivial)', () => {
    const resultados = casos.map(([, t, answers]) => oraclePasses(t, answers));
    expect(resultados).toContain(true);
    expect(resultados).toContain(false);
  });
});
