import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Tree {
  id: number;
  foto: string | null;
  nome_cientifico: string;
  nome_popular: string;
  origem: string;
  decidua_perenifolia: string | null;
  epoca_floracao: string | null;
  epoca_frutificacao: string | null;
  altura_adulta_max_m: number | null;
  porte_altura_classe: string | null;
  diametro_copa_adulto_max_m: number | null;
  copa_classe: string | null;
  dap_adulto_max_cm: number | null;
  altura_primeira_bifurcacao_m: string | null;
  forma_copa: string | null;
  faixa_serv_min_m_recomendada: number | null;
  berco_area_min_m2_recomendada: number | null;
  volume_solo_min_m3_recomendado: number | null;
  compat_fiacao: string | null;
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

type Answers = Record<string, string>;

// ── Helpers ──

function rangeUpperBound(value: string): number {
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

// ── Eliminatory Rules ──

function passesEliminatoryRules(tree: Tree, answers: Answers): boolean {
  // ── Grupo 1: Espaço físico ──

  if (answers.q1_2) {
    const available = rangeUpperBound(answers.q1_2);
    if (tree.faixa_serv_min_m_recomendada != null && tree.faixa_serv_min_m_recomendada > available) return false;
  }
  if (answers.q1_3 === 'sim' && answers.q1_1) {
    const effectiveWidth = rangeUpperBound(answers.q1_1) - 1.20;
    if (tree.faixa_serv_min_m_recomendada != null && tree.faixa_serv_min_m_recomendada > effectiveWidth) return false;
  }
  if (answers.q1_4) {
    const available = rangeUpperBound(answers.q1_4);
    if (tree.berco_area_min_m2_recomendada != null && tree.berco_area_min_m2_recomendada > available) return false;
  }
  if (answers.q1_5 && answers.q1_5 !== 'nao') {
    if (answers.q1_5 === 'sim_convencional' && answers.q1_6 === 'lt_4') {
      if (tree.compat_fiacao === 'N') return false;
    } else if (answers.q1_5 === 'sim_protegida' || answers.q1_6 === 'gt_4') {
      if (tree.compat_fiacao === 'N' && tree.porte_altura_classe === 'Grande') return false;
    }
  }
  if (answers.q1_7 === 'nenhum' || answers.q1_7 === 'lt_2') {
    if (tree.copa_classe === 'Grande') return false;
  }
  if (answers.q1_8a === 'lt_6') {
    if (tree.porte_altura_classe === 'Grande') return false;
  }
  if (answers.q1_8b === 'lt_4') {
    if (tree.copa_classe === 'Grande') return false;
  }
  // q1_8c: guia rebaixada < 1,5m — elimina qualquer árvore (NBR 9050)
  if (answers.q1_8c === 'lt_1_5') return false;
  // q1_8d: boca-de-lobo < 1,5m — elimina árvores com alto potencial de dano à calçada
  if (answers.q1_8d === 'lt_1_5') {
    if ((tree.potencial_dano_calcada_1a5 ?? 0) >= 4) return false;
  }

  // ── Grupo 2: Condições ecológicas (eliminatório conforme planilha) ──

  if (answers.q2_1 === 'sol_pleno' && tree.tolerancia_sol_pleno === false) return false;
  if (answers.q2_1 === 'meia_sombra' && tree.tolerancia_meia_sombra === false) return false;
  if (answers.q2_1 === 'sombra' && tree.tolerancia_sombra === false) return false;

  if (answers.q2_2 === 'seco') {
    if (tree.tolerancia_seca_1a5 != null && tree.tolerancia_seca_1a5 <= 2) return false;
  }
  if (answers.q2_2 === 'encharcado') {
    if (tree.tolerancia_encharcamento_1a5 != null && tree.tolerancia_encharcamento_1a5 <= 3) return false;
  }
  if (answers.q2_3 === 'ruim') {
    if (tree.tolerancia_compactacao_solo_1a5 != null && tree.tolerancia_compactacao_solo_1a5 <= 3) return false;
  }
  if (answers.q2_4 === 'nao') {
    if (tree.tolerancia_seca_1a5 != null && tree.tolerancia_seca_1a5 <= 2) return false;
  }

  // ── Grupo 3: Preferências (eliminatório conforme planilha) ──

  if (answers.q3_1 === 'sim') {
    if (tree.potencial_sujeira_1a5 != null && tree.potencial_sujeira_1a5 >= 3) return false;
  }
  if (answers.q3_2 === 'sim') {
    if (tree.presenca_espinhos === true || tree.presenca_subst_irritantes === true) return false;
  }
  if (answers.q3_3 === 'sim') {
    if (tree.atracao_fauna_1a5 != null && tree.atracao_fauna_1a5 >= 4) return false;
  }

  return true;
}

// ── Classificatory Scoring ──

// MAX_SCORE = 120 (G2+G3) + 10 (Q4.1) + 20 (Q4.2) + 10 (Q5.1) + 10 (Q5.2) + 10 (Q6.1) + 10 (Q6.2) = 190
const MAX_SCORE = 190;

interface ScoreCriterion {
  label: string;
  points: number;
  maxPoints: number;
}

function calculateScore(tree: Tree, answers: Answers): { score: number; breakdown: ScoreCriterion[] } {
  let raw = 0;
  const breakdown: ScoreCriterion[] = [];

  // ── Grupo 2 ──

  // Q2.1 — Insolação (max 20)
  if (answers.q2_1) {
    let pts = 0;
    let label = '';
    if (answers.q2_1 === 'sol_pleno') {
      pts = tree.tolerancia_sol_pleno === true ? 20 : tree.tolerancia_sol_pleno === false ? 0 : 10;
      label = 'Insolação (sol pleno)';
    } else if (answers.q2_1 === 'meia_sombra') {
      pts = tree.tolerancia_meia_sombra === true ? 20 : tree.tolerancia_meia_sombra === false ? 0 : 10;
      label = 'Insolação (meia sombra)';
    } else if (answers.q2_1 === 'sombra') {
      pts = tree.tolerancia_sombra === true ? 20 : tree.tolerancia_sombra === false ? 0 : 10;
      label = 'Insolação (sombra)';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 20 });
  }

  // Q2.2 — Umidade do solo (max 20)
  if (answers.q2_2) {
    let pts = 0;
    let label = '';
    if (answers.q2_2 === 'seco') {
      pts = (tree.tolerancia_seca_1a5 ?? 3) * 4;
      label = 'Tolerância à seca';
    } else if (answers.q2_2 === 'umido') {
      pts = 15;
      label = 'Umidade do solo';
    } else if (answers.q2_2 === 'encharcado') {
      pts = (tree.tolerancia_encharcamento_1a5 ?? 3) * 4;
      label = 'Tolerância a encharcamento';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 20 });
  }

  // Q2.3 — Qualidade do solo (max 20)
  if (answers.q2_3) {
    let pts = 0;
    let label = '';
    if (answers.q2_3 === 'ruim') {
      pts = (tree.tolerancia_compactacao_solo_1a5 ?? 3) * 4;
      label = 'Solo compactado/aterro';
    } else {
      pts = 20;
      label = 'Qualidade do solo';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 20 });
  }

  // Q2.4 — Irrigação (max 10)
  if (answers.q2_4) {
    let pts = 0;
    let label = '';
    if (answers.q2_4 === 'nao') {
      pts = (tree.tolerancia_seca_1a5 ?? 3) * 2;
      label = 'Sem irrigação disponível';
    } else {
      pts = 10;
      label = 'Irrigação disponível';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // ── Grupo 3 ──

  // Q3.1 — Sujeira (max 15)
  if (answers.q3_1) {
    let pts = 0;
    let label = '';
    if (answers.q3_1 === 'sim') {
      pts = (6 - (tree.potencial_sujeira_1a5 ?? 3)) * 3;
      label = 'Potencial de sujeira';
    } else {
      pts = 15;
      label = 'Queda de folhas/frutos';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 15 });
  }

  // Q3.2 — Espinhos/irritantes (max 15)
  if (answers.q3_2) {
    let pts = 0;
    let label = '';
    if (answers.q3_2 === 'sim') {
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

  // Q3.3 — Atração de fauna (max 10)
  if (answers.q3_3) {
    let pts = 0;
    let label = '';
    if (answers.q3_3 === 'sim') {
      pts = (6 - (tree.atracao_fauna_1a5 ?? 3)) * 2;
      label = 'Atração de insetos/abelhas';
    } else {
      pts = 10; label = 'Atração de fauna';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // Q3.4 — Poda (max 10)
  if (answers.q3_4) {
    let pts = 0;
    let label = '';
    if (answers.q3_4 === 'nao') {
      pts = (tree.tolerancia_poda_1a5 ?? 3) * 2;
      label = 'Tolerância a poda mínima';
    } else {
      pts = 10; label = 'Manutenção profissional';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // ── Grupo 4 ──

  // Q4.1 — Tipo de local (max 10)
  if (answers.q4_1) {
    let pts = 0;
    let label = '';
    if (answers.q4_1 === 'calcada') {
      pts = (6 - (tree.potencial_dano_calcada_1a5 ?? 3)) * 2;
      label = 'Adequação à calçada';
    } else if (answers.q4_1 === 'canteiro_central') {
      pts = (tree.tolerancia_poluicao_atmosferica_1a5 ?? 3) * 2;
      label = 'Tolerância à poluição (canteiro)';
    } else if (answers.q4_1 === 'praca_parque') {
      pts = (tree.atracao_fauna_1a5 ?? 3) * 2;
      label = 'Contribuição ecológica (praça)';
    } else if (answers.q4_1 === 'rotatorio') {
      pts = (tree.tolerancia_ventos_fortes_1a5 ?? 3) * 2;
      label = 'Tolerância a ventos (rotatória)';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // Q4.2 — Objetivo(s) principal(is) (max 20, multi-select)
  if (answers.q4_2) {
    const objectives = answers.q4_2.split(',').filter(Boolean);
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

  // ── Grupo 6 ──

  // Q6.1 — Ventos fortes (max 10)
  if (answers.q6_1) {
    let pts = 0;
    let label = '';
    if (answers.q6_1 === 'sim') {
      pts = (tree.tolerancia_ventos_fortes_1a5 ?? 3) * 2;
      label = 'Tolerância a ventos fortes';
    } else {
      pts = 10; label = 'Exposição ao vento';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  // Q6.2 — Ilha de calor (max 10)
  if (answers.q6_2) {
    let pts = 0;
    let label = '';
    if (answers.q6_2 === 'sim') {
      pts = (tree.potencial_sombra_1a5 ?? 3) * 2;
      label = 'Potencial de sombra (ilha de calor)';
    } else {
      pts = 10; label = 'Potencial de sombra';
    }
    raw += pts;
    breakdown.push({ label, points: pts, maxPoints: 10 });
  }

  return { score: Math.round((raw / MAX_SCORE) * 100), breakdown };
}

// ── Criteria Summary ──

function buildCriteriaSummary(answers: Answers): { eliminatory: string[]; classificatory: string[] } {
  const eliminatory: string[] = [];
  const classificatory: string[] = [];

  const widthLabels: Record<string, string> = {
    lt_1: '< 1m', '1_2': '1–2m', '2_3': '2–3m', '3_4': '3–4m', gt_4: '> 4m',
  };

  if (answers.q1_2) eliminatory.push(`Faixa de serviço: ${widthLabels[answers.q1_2] ?? answers.q1_2}`);
  if (answers.q1_3 === 'sim') eliminatory.push('Faixa acessível de 1,20m obrigatória');
  if (answers.q1_4) {
    const bLabels: Record<string, string> = { lt_1: '< 1m²', '1_2': '1–2m²', gt_2: '> 2m²' };
    eliminatory.push(`Berço disponível: ${bLabels[answers.q1_4] ?? answers.q1_4}`);
  }
  if (answers.q1_5 === 'sim_convencional') eliminatory.push('Fiação convencional');
  if (answers.q1_5 === 'sim_protegida') eliminatory.push('Fiação isolada/protegida');
  if (answers.q1_6 === 'lt_4') eliminatory.push('Fiação a < 4m');
  if (answers.q1_7 === 'nenhum') eliminatory.push('Sem recuo da edificação');
  if (answers.q1_7 === 'lt_2') eliminatory.push('Recuo < 2m');
  if (answers.q1_8a === 'lt_6') eliminatory.push('Esquina a < 6m');
  if (answers.q1_8b === 'lt_4') eliminatory.push('Poste a < 4m');
  if (answers.q1_8c === 'lt_1_5') eliminatory.push('Guia rebaixada a < 1,5m');
  if (answers.q1_8d === 'lt_1_5') eliminatory.push('Boca-de-lobo a < 1,5m');
  if (answers.q2_1 === 'sol_pleno') eliminatory.push('Insolação: sol pleno (tolerância obrigatória)');
  if (answers.q2_1 === 'meia_sombra') eliminatory.push('Insolação: meia sombra (tolerância obrigatória)');
  if (answers.q2_1 === 'sombra') eliminatory.push('Insolação: sombra (tolerância obrigatória)');
  if (answers.q2_2 === 'seco') eliminatory.push('Solo seco (tolerância_seca ≥ 3 exigida)');
  if (answers.q2_2 === 'encharcado') eliminatory.push('Solo encharcado (tolerância_encharcamento ≥ 4 exigida)');
  if (answers.q2_3 === 'ruim') eliminatory.push('Solo compactado (tolerância_compactação ≥ 4 exigida)');
  if (answers.q2_4 === 'nao') eliminatory.push('Sem irrigação no 1º ano (tolerância_seca ≥ 3 exigida)');
  if (answers.q3_1 === 'sim') eliminatory.push('Queda de resíduos: elimina potencial_sujeira ≥ 3');
  if (answers.q3_2 === 'sim') eliminatory.push('Espinhos/irritantes: elimina espécies com presença');
  if (answers.q3_3 === 'sim') eliminatory.push('Atração de insetos: elimina atracao_fauna ≥ 4');

  const localLabels: Record<string, string> = {
    calcada: 'Calçada', canteiro_central: 'Canteiro central', praca_parque: 'Praça/parque', rotatorio: 'Rotatória',
  };
  const objLabels: Record<string, string> = {
    sombra: 'Sombra', embelezamento: 'Embelezamento', fauna: 'Atração de fauna',
    baixa_manutencao: 'Baixa manutenção', qualidade_ar: 'Qualidade do ar', nativas: 'Espécies nativas',
  };
  const insolLabels: Record<string, string> = {
    sol_pleno: 'Sol pleno (> 6h)', meia_sombra: 'Meia sombra (3–6h)', sombra: 'Sombra (< 3h)',
  };
  const umidLabels: Record<string, string> = {
    seco: 'Solo seco', umido: 'Solo úmido', encharcado: 'Solo encharcado',
  };

  if (answers.q2_1) classificatory.push(`Insolação: ${insolLabels[answers.q2_1] ?? answers.q2_1}`);
  if (answers.q2_2) classificatory.push(`Umidade: ${umidLabels[answers.q2_2] ?? answers.q2_2}`);
  if (answers.q2_3 === 'ruim') classificatory.push('Solo compactado/aterro');
  if (answers.q2_4 === 'nao') classificatory.push('Sem irrigação no 1º ano');
  if (answers.q3_1 === 'sim') classificatory.push('Queda de resíduos é problema');
  if (answers.q3_2 === 'sim') classificatory.push('Espinhos/irritantes são problema');
  if (answers.q3_3 === 'sim') classificatory.push('Evitar atração de insetos');
  if (answers.q3_4 === 'nao') classificatory.push('Sem poda profissional');
  if (answers.q4_1) classificatory.push(`Local: ${localLabels[answers.q4_1] ?? answers.q4_1}`);
  if (answers.q4_2) {
    const objs = answers.q4_2.split(',').filter(Boolean).map((o) => objLabels[o] ?? o).join(', ');
    classificatory.push(`Objetivo(s): ${objs}`);
  }
  if (answers.q5_1 === 'sim') classificatory.push('Preferência por nativas');
  if (answers.q5_2 === 'sim') classificatory.push('Preferência por espécies atrativas à fauna');
  if (answers.q6_1 === 'sim') classificatory.push('Local exposto a ventos fortes');
  if (answers.q6_2 === 'sim') classificatory.push('Necessidade de sombra (ilha de calor)');

  return { eliminatory, classificatory };
}

// ── Main Handler ──

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { answers } = (await req.json()) as { answers: Answers };

    if (!answers || typeof answers !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Campo "answers" é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: allTrees, error } = await supabase.from('trees').select('*');

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar espécies', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const trees = (allTrees ?? []) as Tree[];
    const totalCount = trees.length;

    // Phase 1: Eliminatory
    const survivors = trees.filter((t) => passesEliminatoryRules(t, answers));

    // Phase 2: Scoring with breakdown
    const scored = survivors.map((t) => {
      const { score, breakdown } = calculateScore(t, answers);
      return { ...t, score, scoreBreakdown: breakdown };
    });

    scored.sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify({
        trees: scored,
        eliminated_count: totalCount - survivors.length,
        criteriaSummary: buildCriteriaSummary(answers),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Erro interno', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
