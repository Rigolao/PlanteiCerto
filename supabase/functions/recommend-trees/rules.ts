// Regras puras do recomendador: eliminatórias, pontuação e resumo de critérios.
// Sem APIs do runtime da Edge Function e sem imports por URL — o index.ts importa daqui e o
// Vitest testa este módulo direto (rules.test.ts).
//
// Lacuna de dado (NULL) significa "não avaliado": nunca aprova um critério
// eliminatório e nunca recebe nota na pontuação. Não usar valor padrão para
// atributo de espécie.

export interface Tree {
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
  ativa?: boolean;
  // Projeção de 10 anos — espelha src/types/tree.ts (a Edge Function não importa de src/).
  // Não entra na pontuação hoje; vem no select('*') e é devolvida ao cliente.
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
  classe_bvoc?: string | null;
  evidencia_bvoc?: string | null;
  confianca_bvoc?: string | null;
  exibir_aviso_bvoc?: boolean | null;
}

export type Answers = Record<string, string>;

type CampoArvore = keyof Tree;

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

export type EliminatoryStatus = 'aprovada' | 'eliminada' | 'requer_avaliacao';

export interface EliminatoryResult {
  status: EliminatoryStatus;
  pendencias: string[];
}

// Nomes de critério das pendências ("<Critério>: não avaliado").
const CRITERIO = {
  faixa: 'Faixa de serviço mínima',
  berco: 'Área mínima de berço',
  fiacao: 'Compatibilidade com fiação',
  porte: 'Porte',
  copa: 'Classe de copa',
  dano: 'Potencial de dano à calçada',
  solPleno: 'Tolerância a sol pleno',
  meiaSombra: 'Tolerância a meia sombra',
  sombra: 'Tolerância a sombra',
  seca: 'Tolerância à seca',
  encharcamento: 'Tolerância a encharcamento',
  compactacao: 'Tolerância à compactação do solo',
  sujeira: 'Potencial de sujeira',
  espinhos: 'Presença de espinhos',
  irritantes: 'Presença de substâncias irritantes',
  fauna: 'Atração de fauna',
} as const;

/**
 * Aplica todas as regras eliminatórias acionadas pelas respostas.
 *
 * - Qualquer violação com valor conhecido → `eliminada`, mesmo que outro critério
 *   esteja sem dado (uma violação conhecida basta para descartar a espécie).
 * - Sem violação, mas com campo exigido NULL → `requer_avaliacao`.
 * - Caso contrário → `aprovada`.
 *
 * `pendencias` lista, sem repetição e na ordem das regras, os critérios exigidos
 * que estão sem dado — inclusive quando a espécie sai eliminada; o status decide.
 */
export function evaluateEliminatory(tree: Tree, answers: Answers): EliminatoryResult {
  const violados: string[] = [];
  const naoAvaliados = new Set<string>(); // Set preserva a ordem de inserção

  // Campo exigido por uma regra acionada: NULL fica pendente; valor conhecido que viola elimina.
  function exigir<T>(criterio: string, valor: T | null | undefined, viola: (v: T) => boolean): void {
    if (valor == null) naoAvaliados.add(criterio);
    else if (viola(valor)) violados.push(criterio);
  }

  // ── Grupo 2: Espaço físico ──

  if (answers.q2_2) {
    const available = rangeUpperBound(answers.q2_2);
    exigir(CRITERIO.faixa, tree.faixa_serv_min_m_recomendada, (v) => v > available);
  }
  if (answers.q2_3 === 'sim' && answers.q2_1) {
    const effectiveWidth = rangeUpperBound(answers.q2_1) - 1.20;
    exigir(CRITERIO.faixa, tree.faixa_serv_min_m_recomendada, (v) => v > effectiveWidth);
  }
  if (answers.q2_4) {
    const available = rangeUpperBound(answers.q2_4);
    exigir(CRITERIO.berco, tree.berco_area_min_m2_recomendada, (v) => v > available);
  }
  if (answers.q2_5 && answers.q2_5 !== 'nao') {
    if (answers.q2_5 === 'sim_convencional' && answers.q2_6 === 'lt_4') {
      exigir(CRITERIO.fiacao, tree.compat_fiacao, (v) => v === 'N');
    } else if (answers.q2_5 === 'sim_protegida' || answers.q2_6 === 'gt_4') {
      // Elimina só compat 'N' ∧ porte 'Grande', em lógica de três valores
      // (null = desconhecido): um lado conhecido e falso já aprova, qualquer que
      // seja o outro; sem lado falso, cada lado desconhecido vira pendência.
      const compatN = tree.compat_fiacao == null ? null : tree.compat_fiacao === 'N';
      const porteGrande = tree.porte_altura_classe == null ? null : tree.porte_altura_classe === 'Grande';
      if (compatN === true && porteGrande === true) {
        violados.push(CRITERIO.fiacao);
      } else if (compatN !== false && porteGrande !== false) {
        if (compatN === null) naoAvaliados.add(CRITERIO.fiacao);
        if (porteGrande === null) naoAvaliados.add(CRITERIO.porte);
      }
    }
  }
  if (answers.q2_7 === 'nenhum' || answers.q2_7 === 'lt_2') {
    exigir(CRITERIO.copa, tree.copa_classe, (v) => v === 'Grande');
  }
  if (answers.q2_8a === 'lt_6') {
    exigir(CRITERIO.porte, tree.porte_altura_classe, (v) => v === 'Grande');
  }
  if (answers.q2_8b === 'lt_4') {
    exigir(CRITERIO.copa, tree.copa_classe, (v) => v === 'Grande');
  }
  // q2_8c: guia rebaixada < 1,5m — elimina qualquer árvore (NBR 9050)
  if (answers.q2_8c === 'lt_1_5') violados.push('Guia rebaixada');
  // q2_8d: boca-de-lobo < 1,5m — elimina árvores com alto potencial de dano à calçada
  if (answers.q2_8d === 'lt_1_5') {
    exigir(CRITERIO.dano, tree.potencial_dano_calcada_1a5, (v) => v >= 4);
  }

  // ── Grupo 3: Condições ecológicas (eliminatório conforme planilha) ──

  if (answers.q3_1 === 'sol_pleno') exigir(CRITERIO.solPleno, tree.tolerancia_sol_pleno, (v) => v === false);
  if (answers.q3_1 === 'meia_sombra') exigir(CRITERIO.meiaSombra, tree.tolerancia_meia_sombra, (v) => v === false);
  if (answers.q3_1 === 'sombra') exigir(CRITERIO.sombra, tree.tolerancia_sombra, (v) => v === false);

  if (answers.q3_2 === 'seco') {
    exigir(CRITERIO.seca, tree.tolerancia_seca_1a5, (v) => v <= 2);
  }
  if (answers.q3_2 === 'encharcado') {
    exigir(CRITERIO.encharcamento, tree.tolerancia_encharcamento_1a5, (v) => v <= 3);
  }
  if (answers.q3_3 === 'ruim') {
    exigir(CRITERIO.compactacao, tree.tolerancia_compactacao_solo_1a5, (v) => v <= 3);
  }
  if (answers.q3_4 === 'nao') {
    exigir(CRITERIO.seca, tree.tolerancia_seca_1a5, (v) => v <= 2);
  }

  // ── Grupo 4: Preferências (eliminatório conforme planilha) ──

  if (answers.q4_1 === 'sim') {
    exigir(CRITERIO.sujeira, tree.potencial_sujeira_1a5, (v) => v >= 3);
  }
  if (answers.q4_2 === 'sim') {
    exigir(CRITERIO.espinhos, tree.presenca_espinhos, (v) => v === true);
    exigir(CRITERIO.irritantes, tree.presenca_subst_irritantes, (v) => v === true);
  }
  if (answers.q4_3 === 'sim') {
    exigir(CRITERIO.fauna, tree.atracao_fauna_1a5, (v) => v >= 4);
  }

  const pendencias = [...naoAvaliados].map((criterio) => `${criterio}: não avaliado`);
  if (violados.length > 0) return { status: 'eliminada', pendencias };
  if (pendencias.length > 0) return { status: 'requer_avaliacao', pendencias };
  return { status: 'aprovada', pendencias };
}

// ── Classificatory Scoring ──

// MAX_SCORE = 120 (G2+G3) + 10 (Q4.1) + 20 (Q4.2) + 10 (Q5.1) + 10 (Q5.2) + 10 (Q6.1) + 10 (Q6.2) = 190
export const MAX_SCORE = 190;

export type ScoreStatus = 'avaliado' | 'nao_avaliado' | 'estimado';

export interface ScoreCriterion {
  label: string;
  points: number;
  maxPoints: number;
  /** Campo da espécie usado, quando o item depende de um único campo. */
  campo?: string;
  status: ScoreStatus;
}

const SUFIXO_NAO_AVALIADO = ' (não avaliado)';

/**
 * Pontua a espécie com as mesmas fórmulas e máximos de antes, mas um campo NULL
 * vale 0 ponto e marca o item como `nao_avaliado` (rótulo + " (não avaliado)").
 * `estimados` traz chaves `"<tree_id>:<campo>"` de valores estimados; um item que
 * usa um desses valores fica `estimado`. Itens que dependem só da resposta ficam
 * `avaliado`, sem `campo`.
 */
export function calculateScore(
  tree: Tree,
  answers: Answers,
  estimados: Set<string>,
): { score: number; breakdown: ScoreCriterion[] } {
  let raw = 0;
  const breakdown: ScoreCriterion[] = [];

  const ehEstimado = (campo: CampoArvore) => estimados.has(`${tree.id}:${campo}`);
  // Status de item com vários campos: estimado se algum campo usado e não-NULL for estimado.
  const statusDe = (camposUsados: CampoArvore[]): ScoreStatus =>
    camposUsados.some(ehEstimado) ? 'estimado' : 'avaliado';

  function add(criterion: ScoreCriterion): void {
    raw += criterion.points;
    breakdown.push(criterion);
  }

  // Item que depende só da resposta do usuário.
  function fixo(label: string, points: number, maxPoints: number): void {
    add({ label, points, maxPoints, status: 'avaliado' });
  }

  // Item que lê um único campo da espécie.
  function porCampo<K extends CampoArvore>(
    label: string,
    maxPoints: number,
    campo: K,
    pontos: (valor: NonNullable<Tree[K]>) => number,
  ): void {
    const valor = tree[campo];
    if (valor == null) {
      add({ label: label + SUFIXO_NAO_AVALIADO, points: 0, maxPoints, campo, status: 'nao_avaliado' });
      return;
    }
    add({ label, points: pontos(valor), maxPoints, campo, status: ehEstimado(campo) ? 'estimado' : 'avaliado' });
  }

  // ── Grupo 3: Ecológico ──

  // Q3.1 — Insolação (max 20)
  if (answers.q3_1) {
    if (answers.q3_1 === 'sol_pleno') {
      porCampo('Insolação (sol pleno)', 20, 'tolerancia_sol_pleno', (v) => (v ? 20 : 0));
    } else if (answers.q3_1 === 'meia_sombra') {
      porCampo('Insolação (meia sombra)', 20, 'tolerancia_meia_sombra', (v) => (v ? 20 : 0));
    } else if (answers.q3_1 === 'sombra') {
      porCampo('Insolação (sombra)', 20, 'tolerancia_sombra', (v) => (v ? 20 : 0));
    } else {
      fixo('', 0, 20);
    }
  }

  // Q3.2 — Umidade do solo (max 20)
  if (answers.q3_2) {
    if (answers.q3_2 === 'seco') {
      porCampo('Tolerância à seca', 20, 'tolerancia_seca_1a5', (v) => v * 4);
    } else if (answers.q3_2 === 'umido') {
      fixo('Umidade do solo', 15, 20);
    } else if (answers.q3_2 === 'encharcado') {
      porCampo('Tolerância a encharcamento', 20, 'tolerancia_encharcamento_1a5', (v) => v * 4);
    } else {
      fixo('', 0, 20);
    }
  }

  // Q3.3 — Qualidade do solo (max 20)
  if (answers.q3_3) {
    if (answers.q3_3 === 'ruim') {
      porCampo('Solo compactado/aterro', 20, 'tolerancia_compactacao_solo_1a5', (v) => v * 4);
    } else {
      fixo('Qualidade do solo', 20, 20);
    }
  }

  // Q3.4 — Irrigação (max 10)
  if (answers.q3_4) {
    if (answers.q3_4 === 'nao') {
      porCampo('Sem irrigação disponível', 10, 'tolerancia_seca_1a5', (v) => v * 2);
    } else {
      fixo('Irrigação disponível', 10, 10);
    }
  }

  // ── Grupo 4: Preferências ──

  // Q4.1 — Sujeira (max 15)
  if (answers.q4_1) {
    if (answers.q4_1 === 'sim') {
      porCampo('Potencial de sujeira', 15, 'potencial_sujeira_1a5', (v) => (6 - v) * 3);
    } else {
      fixo('Queda de folhas/frutos', 15, 15);
    }
  }

  // Q4.2 — Espinhos/irritantes (max 15): só `false` explícito conta como ausência.
  if (answers.q4_2) {
    if (answers.q4_2 === 'sim') {
      const campos: CampoArvore[] = ['presenca_espinhos', 'presenca_subst_irritantes'];
      const conhecidos = campos.filter((c) => tree[c] != null);
      if (conhecidos.length === 0) {
        add({ label: 'Espinhos/irritantes' + SUFIXO_NAO_AVALIADO, points: 0, maxPoints: 15, status: 'nao_avaliado' });
      } else {
        const ausencias = campos.filter((c) => tree[c] === false).length;
        const status = statusDe(conhecidos);
        if (ausencias === 2) {
          add({ label: 'Sem espinhos/irritantes', points: 15, maxPoints: 15, status });
        } else if (ausencias === 1) {
          add({ label: 'Espinhos/irritantes (parcial)', points: 7, maxPoints: 15, status });
        } else {
          add({ label: 'Presença de espinhos/irritantes', points: 0, maxPoints: 15, status });
        }
      }
    } else {
      fixo('Espinhos/irritantes', 15, 15);
    }
  }

  // Q4.3 — Atração de insetos (max 10)
  if (answers.q4_3) {
    if (answers.q4_3 === 'sim') {
      porCampo('Atração de insetos/abelhas', 10, 'atracao_fauna_1a5', (v) => (6 - v) * 2);
    } else {
      fixo('Atração de fauna', 10, 10);
    }
  }

  // Q4.4 — Poda (max 10)
  if (answers.q4_4) {
    if (answers.q4_4 === 'nao') {
      porCampo('Tolerância a poda mínima', 10, 'tolerancia_poda_1a5', (v) => v * 2);
    } else {
      fixo('Manutenção profissional', 10, 10);
    }
  }

  // ── Grupo 1: Contexto ──

  // Q1.1 — Tipo de local (max 10)
  if (answers.q1_1) {
    if (answers.q1_1 === 'calcada') {
      porCampo('Adequação à calçada', 10, 'potencial_dano_calcada_1a5', (v) => (6 - v) * 2);
    } else if (answers.q1_1 === 'canteiro_central') {
      porCampo('Tolerância à poluição (canteiro)', 10, 'tolerancia_poluicao_atmosferica_1a5', (v) => v * 2);
    } else if (answers.q1_1 === 'praca_parque') {
      porCampo('Contribuição ecológica (praça)', 10, 'atracao_fauna_1a5', (v) => v * 2);
    } else if (answers.q1_1 === 'rotatorio') {
      porCampo('Tolerância a ventos (rotatória)', 10, 'tolerancia_ventos_fortes_1a5', (v) => v * 2);
    } else {
      fixo('', 0, 10);
    }
  }

  // Q1.2 — Objetivo(s) principal(is) (max 20, multi-select)
  // Cota cujo campo é NULL soma 0. O item fica `nao_avaliado` se todas as cotas que
  // dependem de campo estiverem sem dado; `estimado` se alguma usar valor estimado.
  if (answers.q1_2) {
    const objectives = answers.q1_2.split(',').filter(Boolean);
    const quota = 20 / objectives.length;
    let totalPts = 0;
    let cotasComCampo = 0;
    let cotasNulas = 0;
    const usados: CampoArvore[] = [];

    const cotaPorNota = (campo: CampoArvore, valor: number | null, fracao: (v: number) => number) => {
      cotasComCampo += 1;
      if (valor == null) {
        cotasNulas += 1;
        return;
      }
      usados.push(campo);
      totalPts += fracao(valor) * quota;
    };

    for (const obj of objectives) {
      if (obj === 'sombra') {
        cotaPorNota('potencial_sombra_1a5', tree.potencial_sombra_1a5, (v) => v / 5);
      } else if (obj === 'embelezamento') {
        // Proxy: atracao_fauna (espécies com boa floração tendem a atrair fauna)
        cotaPorNota('atracao_fauna_1a5', tree.atracao_fauna_1a5, (v) => v / 5);
      } else if (obj === 'fauna') {
        cotaPorNota('atracao_fauna_1a5', tree.atracao_fauna_1a5, (v) => v / 5);
      } else if (obj === 'baixa_manutencao') {
        // Perenifólia vale a cota inteira; decídua/semidecídua usa a sujeira.
        // Sem a fenologia (NULL) a cota é NULL — não se infere pela sujeira.
        if (tree.decidua_perenifolia == null) {
          cotasComCampo += 1;
          cotasNulas += 1;
        } else if (tree.decidua_perenifolia === 'Perenifólia') {
          cotasComCampo += 1;
          usados.push('decidua_perenifolia');
          totalPts += quota;
        } else {
          usados.push('decidua_perenifolia');
          cotaPorNota('potencial_sujeira_1a5', tree.potencial_sujeira_1a5, (v) => (6 - v) / 5);
        }
      } else if (obj === 'qualidade_ar') {
        cotaPorNota('contribuicao_biodiversidade_1a5', tree.contribuicao_biodiversidade_1a5, (v) => v / 5);
      } else if (obj === 'nativas') {
        cotasComCampo += 1;
        usados.push('origem');
        totalPts += tree.origem === 'Nativa BR' ? quota : 0;
      }
    }

    const label = 'Objetivo(s) de plantio';
    if (cotasComCampo > 0 && cotasNulas === cotasComCampo) {
      add({ label: label + SUFIXO_NAO_AVALIADO, points: 0, maxPoints: 20, status: 'nao_avaliado' });
    } else {
      add({ label, points: Math.round(totalPts), maxPoints: 20, status: statusDe(usados) });
    }
  }

  // ── Grupo 5 ──

  // Q5.1 — Preferência por nativas (max 10)
  if (answers.q5_1) {
    if (answers.q5_1 === 'sim') {
      porCampo('Espécie nativa', 10, 'origem', (v) => (v === 'Nativa BR' ? 10 : 0));
    } else {
      fixo('Origem da espécie', 10, 10);
    }
  }

  // Q5.2 — Preferência por fauna (max 10)
  if (answers.q5_2) {
    if (answers.q5_2 === 'sim') {
      porCampo('Atração de fauna (preferência)', 10, 'atracao_fauna_1a5', (v) => v * 2);
    } else {
      fixo('Atração de fauna', 10, 10);
    }
  }

  // Q3.5 — Ventos fortes (max 10)
  if (answers.q3_5) {
    if (answers.q3_5 === 'sim') {
      porCampo('Tolerância a ventos fortes', 10, 'tolerancia_ventos_fortes_1a5', (v) => v * 2);
    } else {
      fixo('Exposição ao vento', 10, 10);
    }
  }

  // Q3.6 — Ilha de calor (max 10)
  if (answers.q3_6) {
    if (answers.q3_6 === 'sim') {
      porCampo('Potencial de sombra (ilha de calor)', 10, 'potencial_sombra_1a5', (v) => v * 2);
    } else {
      fixo('Potencial de sombra', 10, 10);
    }
  }

  return { score: Math.round((raw / MAX_SCORE) * 100), breakdown };
}

// ── Criteria Summary ──

export function buildCriteriaSummary(answers: Answers): { eliminatory: string[]; classificatory: string[] } {
  const eliminatory: string[] = [];
  const classificatory: string[] = [];

  const widthLabels: Record<string, string> = {
    lt_1: '< 1m', '1_2': '1–2m', '2_3': '2–3m', '3_4': '3–4m', gt_4: '> 4m',
  };

  if (answers.q2_2) eliminatory.push(`Faixa de serviço: ${widthLabels[answers.q2_2] ?? answers.q2_2}`);
  if (answers.q2_3 === 'sim') eliminatory.push('Faixa acessível de 1,20m obrigatória');
  if (answers.q2_4) {
    const bLabels: Record<string, string> = { lt_1: '< 1m²', '1_2': '1–2m²', gt_2: '> 2m²' };
    eliminatory.push(`Berço disponível: ${bLabels[answers.q2_4] ?? answers.q2_4}`);
  }
  if (answers.q2_5 === 'sim_convencional') eliminatory.push('Fiação convencional');
  if (answers.q2_5 === 'sim_protegida') eliminatory.push('Fiação isolada/protegida');
  if (answers.q2_6 === 'lt_4') eliminatory.push('Fiação a < 4m');
  if (answers.q2_7 === 'nenhum') eliminatory.push('Sem recuo da edificação');
  if (answers.q2_7 === 'lt_2') eliminatory.push('Recuo < 2m');
  if (answers.q2_8a === 'lt_6') eliminatory.push('Esquina a < 6m');
  if (answers.q2_8b === 'lt_4') eliminatory.push('Poste a < 4m');
  if (answers.q2_8c === 'lt_1_5') eliminatory.push('Guia rebaixada a < 1,5m');
  if (answers.q2_8d === 'lt_1_5') eliminatory.push('Boca-de-lobo a < 1,5m');
  if (answers.q3_1 === 'sol_pleno') eliminatory.push('Insolação: sol pleno (tolerância obrigatória)');
  if (answers.q3_1 === 'meia_sombra') eliminatory.push('Insolação: meia sombra (tolerância obrigatória)');
  if (answers.q3_1 === 'sombra') eliminatory.push('Insolação: sombra (tolerância obrigatória)');
  if (answers.q3_2 === 'seco') eliminatory.push('Solo seco (tolerância_seca ≥ 3 exigida)');
  if (answers.q3_2 === 'encharcado') eliminatory.push('Solo encharcado (tolerância_encharcamento ≥ 4 exigida)');
  if (answers.q3_3 === 'ruim') eliminatory.push('Solo compactado (tolerância_compactação ≥ 4 exigida)');
  if (answers.q3_4 === 'nao') eliminatory.push('Sem irrigação no 1º ano (tolerância_seca ≥ 3 exigida)');
  if (answers.q4_1 === 'sim') eliminatory.push('Queda de resíduos: elimina potencial_sujeira ≥ 3');
  if (answers.q4_2 === 'sim') eliminatory.push('Espinhos/irritantes: elimina espécies com presença');
  if (answers.q4_3 === 'sim') eliminatory.push('Atração de insetos: elimina atracao_fauna ≥ 4');

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

  if (answers.q3_1) classificatory.push(`Insolação: ${insolLabels[answers.q3_1] ?? answers.q3_1}`);
  if (answers.q3_2) classificatory.push(`Umidade: ${umidLabels[answers.q3_2] ?? answers.q3_2}`);
  if (answers.q3_3 === 'ruim') classificatory.push('Solo compactado/aterro');
  if (answers.q3_4 === 'nao') classificatory.push('Sem irrigação no 1º ano');
  if (answers.q4_1 === 'sim') classificatory.push('Queda de resíduos é problema');
  if (answers.q4_2 === 'sim') classificatory.push('Espinhos/irritantes são problema');
  if (answers.q4_3 === 'sim') classificatory.push('Evitar atração de insetos');
  if (answers.q4_4 === 'nao') classificatory.push('Sem poda profissional');
  if (answers.q1_1) classificatory.push(`Local: ${localLabels[answers.q1_1] ?? answers.q1_1}`);
  if (answers.q1_2) {
    const objs = answers.q1_2.split(',').filter(Boolean).map((o) => objLabels[o] ?? o).join(', ');
    classificatory.push(`Objetivo(s): ${objs}`);
  }
  if (answers.q5_1 === 'sim') classificatory.push('Preferência por nativas');
  if (answers.q5_2 === 'sim') classificatory.push('Preferência por espécies atrativas à fauna');
  if (answers.q3_5 === 'sim') classificatory.push('Local exposto a ventos fortes');
  if (answers.q3_6 === 'sim') classificatory.push('Necessidade de sombra (ilha de calor)');

  return { eliminatory, classificatory };
}
