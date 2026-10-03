import type { Arvore } from '../types/tree';

export type TreeQualityImpact = 'eligibility' | 'ranking';

export interface TreeQualityRule {
  field: keyof Arvore;
  label: string;
  impacts: TreeQualityImpact[];
  criteria: string;
  expectedFormat: string;
  missingBehavior: string;
  questionIds: string[];
}

export type TreeQualityIssue = TreeQualityRule;

export interface TreeQualitySummary {
  totalTrees: number;
  totalIssues: number;
  treesWithEligibilityGaps: number;
  treesWithRankingGaps: number;
  treesWithoutMappedGaps: number;
}

export type TreeInformationGroup = 'Identificação e fenologia' | 'Características adultas' | 'Projeção de crescimento' | 'Emissões BVOC';

export interface TreeInformationField {
  field: keyof Arvore;
  label: string;
  group: TreeInformationGroup;
  expectedFormat: string;
  note?: string;
}

export interface TreeInformationSummary {
  totalGaps: number;
  treesWithGaps: number;
  fields: Array<{ field: keyof Arvore; label: string; count: number; group: TreeInformationGroup }>;
}

/**
 * Fields read by the recommendation function. A missing value can either let
 * a tree pass an eliminatory rule (`eligibility`) or affect its score (`ranking`).
 * These are potential impacts; the exact effect depends on the user's answers.
 */
export const TREE_QUALITY_RULES: TreeQualityRule[] = [
  {
    field: 'faixa_serv_min_m_recomendada',
    label: 'Largura mínima da faixa de serviço',
    impacts: ['eligibility'],
    criteria: 'largura da faixa de serviço e faixa livre',
    expectedFormat: 'Medida em metros (m). Informe um número maior ou igual a zero.',
    missingBehavior: 'A comparação com a faixa disponível é ignorada; a árvore pode passar sem essa checagem de espaço.',
    questionIds: ['q2_2', 'q2_3'],
  },
  {
    field: 'berco_area_min_m2_recomendada',
    label: 'Área mínima do berço',
    impacts: ['eligibility'],
    criteria: 'área disponível para o berço de plantio',
    expectedFormat: 'Área em metros quadrados (m²). Informe um número maior ou igual a zero.',
    missingBehavior: 'A comparação com a área do berço é ignorada; a árvore pode passar sem essa checagem de espaço.',
    questionIds: ['q2_4'],
  },
  {
    field: 'compat_fiacao',
    label: 'Compatibilidade com fiação',
    impacts: ['eligibility'],
    criteria: 'presença e distância de fiação aérea',
    expectedFormat: 'N = incompatível, A = compatível com atenção, C = compatível.',
    missingBehavior: 'Como o valor não é N, a incompatibilidade não é detectada e a árvore pode passar pela regra de fiação.',
    questionIds: ['q2_5', 'q2_6'],
  },
  {
    field: 'copa_classe',
    label: 'Classe de copa',
    impacts: ['eligibility'],
    criteria: 'recuo da edificação e distância de postes',
    expectedFormat: 'Grande, Média ou Pequena.',
    missingBehavior: 'A regra que elimina copas grandes não é acionada para este atributo.',
    questionIds: ['q2_7', 'q2_8b'],
  },
  {
    field: 'porte_altura_classe',
    label: 'Classe de altura',
    impacts: ['eligibility'],
    criteria: 'distância de esquinas e compatibilidade com fiação',
    expectedFormat: 'Grande, Médio ou Pequeno.',
    missingBehavior: 'As regras que eliminam árvores altas não são acionadas para este atributo.',
    questionIds: ['q2_6', 'q2_8a'],
  },
  {
    field: 'potencial_dano_calcada_1a5',
    label: 'Potencial de dano à calçada',
    impacts: ['eligibility', 'ranking'],
    criteria: 'distância de bocas-de-lobo e adequação à calçada',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Na regra da boca-de-lobo, o valor ausente é tratado como 0; na pontuação de calçada, como 3/5.',
    questionIds: ['q2_8d', 'q1_1'],
  },
  {
    field: 'tolerancia_sol_pleno',
    label: 'Tolerância a sol pleno',
    impacts: ['eligibility', 'ranking'],
    criteria: 'insolação do local',
    expectedFormat: 'Sim (true) ou não (false).',
    missingBehavior: 'Não elimina a árvore; quando a condição correspondente é pontuada, recebe a pontuação neutra de 10/20.',
    questionIds: ['q3_1'],
  },
  {
    field: 'tolerancia_meia_sombra',
    label: 'Tolerância a meia-sombra',
    impacts: ['eligibility', 'ranking'],
    criteria: 'insolação do local',
    expectedFormat: 'Sim (true) ou não (false).',
    missingBehavior: 'Não elimina a árvore; quando a condição correspondente é pontuada, recebe a pontuação neutra de 10/20.',
    questionIds: ['q3_1'],
  },
  {
    field: 'tolerancia_sombra',
    label: 'Tolerância à sombra',
    impacts: ['eligibility', 'ranking'],
    criteria: 'insolação do local',
    expectedFormat: 'Sim (true) ou não (false).',
    missingBehavior: 'Não elimina a árvore; quando a condição correspondente é pontuada, recebe a pontuação neutra de 10/20.',
    questionIds: ['q3_1'],
  },
  {
    field: 'tolerancia_seca_1a5',
    label: 'Tolerância à seca',
    impacts: ['eligibility', 'ranking'],
    criteria: 'umidade do solo e disponibilidade de irrigação',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Não elimina por baixa tolerância e recebe o valor padrão 3/5 nas pontuações relacionadas.',
    questionIds: ['q3_2', 'q3_4'],
  },
  {
    field: 'tolerancia_encharcamento_1a5',
    label: 'Tolerância a encharcamento',
    impacts: ['eligibility', 'ranking'],
    criteria: 'umidade do solo',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Não elimina por baixa tolerância e recebe o valor padrão 3/5 na pontuação de umidade.',
    questionIds: ['q3_2'],
  },
  {
    field: 'tolerancia_compactacao_solo_1a5',
    label: 'Tolerância à compactação do solo',
    impacts: ['eligibility', 'ranking'],
    criteria: 'qualidade do solo',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Não elimina por baixa tolerância e recebe o valor padrão 3/5 na pontuação de solo compactado.',
    questionIds: ['q3_3'],
  },
  {
    field: 'potencial_sujeira_1a5',
    label: 'Potencial de sujeira',
    impacts: ['eligibility', 'ranking'],
    criteria: 'preferência por pouca queda de folhas e frutos',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Não elimina por potencial de sujeira e recebe o valor padrão 3/5 na pontuação de manutenção.',
    questionIds: ['q4_1', 'q1_2'],
  },
  {
    field: 'presenca_espinhos',
    label: 'Presença de espinhos',
    impacts: ['eligibility', 'ranking'],
    criteria: 'preferência sobre espinhos e substâncias irritantes',
    expectedFormat: 'Sim (true) ou não (false).',
    missingBehavior: 'Não elimina a árvore; na pontuação, o campo ausente é tratado como ausência de espinhos.',
    questionIds: ['q4_2'],
  },
  {
    field: 'presenca_subst_irritantes',
    label: 'Presença de substâncias irritantes',
    impacts: ['eligibility', 'ranking'],
    criteria: 'preferência sobre espinhos e substâncias irritantes',
    expectedFormat: 'Sim (true) ou não (false).',
    missingBehavior: 'Não elimina a árvore; na pontuação, o campo ausente é tratado como ausência de substâncias irritantes.',
    questionIds: ['q4_2'],
  },
  {
    field: 'atracao_fauna_1a5',
    label: 'Atração de fauna',
    impacts: ['eligibility', 'ranking'],
    criteria: 'preferências por fauna e insetos',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Não elimina por atração de fauna e recebe o valor padrão 3/5 nas pontuações relacionadas.',
    questionIds: ['q4_3', 'q1_1', 'q1_2', 'q5_2'],
  },
  {
    field: 'tolerancia_poda_1a5',
    label: 'Tolerância à poda',
    impacts: ['ranking'],
    criteria: 'disponibilidade de manutenção profissional',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Recebe o valor padrão 3/5 quando a resposta sobre poda profissional é pontuada.',
    questionIds: ['q4_4'],
  },
  {
    field: 'tolerancia_poluicao_atmosferica_1a5',
    label: 'Tolerância à poluição atmosférica',
    impacts: ['ranking'],
    criteria: 'tipo de local de plantio',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Recebe o valor padrão 3/5 na pontuação de canteiro central.',
    questionIds: ['q1_1'],
  },
  {
    field: 'tolerancia_ventos_fortes_1a5',
    label: 'Tolerância a ventos fortes',
    impacts: ['ranking'],
    criteria: 'exposição ao vento e tipo de local',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Recebe o valor padrão 3/5 na pontuação de rotatória ou quando o local é muito exposto a ventos fortes.',
    questionIds: ['q1_1', 'q3_5'],
  },
  {
    field: 'potencial_sombra_1a5',
    label: 'Potencial de sombra',
    impacts: ['ranking'],
    criteria: 'objetivo de sombra e ilha de calor',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Recebe o valor padrão 3/5 na pontuação do objetivo de sombra ou da necessidade de reduzir ilha de calor.',
    questionIds: ['q1_2', 'q3_6'],
  },
  {
    field: 'contribuicao_biodiversidade_1a5',
    label: 'Contribuição para biodiversidade',
    impacts: ['ranking'],
    criteria: 'objetivos ecológicos do plantio',
    expectedFormat: 'Escala de 1 a 5.',
    missingBehavior: 'Recebe o valor padrão 3/5 na pontuação de qualidade do ar e biodiversidade.',
    questionIds: ['q1_2'],
  },
  {
    field: 'decidua_perenifolia',
    label: 'Comportamento foliar',
    impacts: ['ranking'],
    criteria: 'objetivo de baixa manutenção',
    expectedFormat: 'Perenifólia, Decídua ou Semidecídua.',
    missingBehavior: 'Não recebe o bônus de espécie perenifólia; a pontuação segue pela estimativa de sujeira.',
    questionIds: ['q1_2'],
  },
  {
    field: 'origem',
    label: 'Origem da espécie',
    impacts: ['ranking'],
    criteria: 'preferência por espécies nativas',
    expectedFormat: 'Nativa BR ou Exótica.',
    missingBehavior: 'É tratada como não nativa e não recebe pontos quando a preferência por nativas é considerada.',
    questionIds: ['q1_2', 'q5_1'],
  },
];

/** Complementary fields that do not affect recommendation eligibility or score. */
export const TREE_INFORMATION_FIELDS: TreeInformationField[] = [
  { field: 'foto', label: 'Foto', group: 'Identificação e fenologia', expectedFormat: 'URL de imagem acessível.' },
  { field: 'epoca_floracao', label: 'Época de floração', group: 'Identificação e fenologia', expectedFormat: 'Meses ou período do ano.' },
  { field: 'epoca_frutificacao', label: 'Época de frutificação', group: 'Identificação e fenologia', expectedFormat: 'Meses ou período do ano.' },
  { field: 'altura_adulta_max_m', label: 'Altura adulta máxima', group: 'Características adultas', expectedFormat: 'Medida em metros (m).' },
  { field: 'diametro_copa_adulto_max_m', label: 'Diâmetro adulto máximo da copa', group: 'Características adultas', expectedFormat: 'Medida em metros (m).' },
  { field: 'dap_adulto_max_cm', label: 'DAP adulto máximo', group: 'Características adultas', expectedFormat: 'Medida em centímetros (cm).' },
  { field: 'altura_primeira_bifurcacao_m', label: 'Altura da primeira bifurcação', group: 'Características adultas', expectedFormat: 'Medida em metros (m).' },
  { field: 'forma_copa', label: 'Forma da copa', group: 'Características adultas', expectedFormat: 'Descrição botânica da forma.' },
  { field: 'volume_solo_min_m3_recomendado', label: 'Volume mínimo de solo', group: 'Características adultas', expectedFormat: 'Volume em metros cúbicos (m³).' },
  { field: 'dap_10a_cm', label: 'DAP estimado em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em centímetros (cm).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'dap_10a_min_cm', label: 'DAP mínimo em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em centímetros (cm).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'dap_10a_max_cm', label: 'DAP máximo em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em centímetros (cm).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'altura_10a_m', label: 'Altura estimada em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em metros (m).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'altura_10a_min_m', label: 'Altura mínima em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em metros (m).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'altura_10a_max_m', label: 'Altura máxima em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em metros (m).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'biomassa_aerea_10a_kg', label: 'Biomassa aérea em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Massa em quilogramas (kg).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'carbono_armazenado_10a_kg', label: 'Carbono armazenado em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Massa em quilogramas (kg).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'co2e_10a_kg', label: 'CO₂e potencial em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Massa equivalente em quilogramas (kg).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'sobrevivencia_10a_pct', label: 'Sobrevivência estimada em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Percentual de 0 a 100%.', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'co2e_esperado_por_muda_10a_kg', label: 'CO₂e esperado por muda em 10 anos', group: 'Projeção de crescimento', expectedFormat: 'Massa equivalente em quilogramas (kg).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'dap_20a_cm', label: 'DAP estimado em 20 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em centímetros (cm).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'dap_20a_min_cm', label: 'DAP mínimo em 20 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em centímetros (cm).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'dap_20a_max_cm', label: 'DAP máximo em 20 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em centímetros (cm).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'altura_20a_m', label: 'Altura estimada em 20 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em metros (m).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'altura_20a_min_m', label: 'Altura mínima em 20 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em metros (m).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'altura_20a_max_m', label: 'Altura máxima em 20 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em metros (m).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'dap_30a_cm', label: 'DAP estimado em 30 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em centímetros (cm).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'dap_30a_min_cm', label: 'DAP mínimo em 30 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em centímetros (cm).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'dap_30a_max_cm', label: 'DAP máximo em 30 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em centímetros (cm).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'altura_30a_m', label: 'Altura estimada em 30 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em metros (m).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'altura_30a_min_m', label: 'Altura mínima em 30 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em metros (m).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'altura_30a_max_m', label: 'Altura máxima em 30 anos', group: 'Projeção de crescimento', expectedFormat: 'Medida em metros (m).', note: 'Projeção opcional; pode não se aplicar a todas as espécies.' },
  { field: 'classe_bvoc', label: 'Classificação BVOC', group: 'Emissões BVOC', expectedFormat: 'Baixo, moderado, alto, desconhecido ou indeterminado.' },
  { field: 'evidencia_bvoc', label: 'Evidência da classificação BVOC', group: 'Emissões BVOC', expectedFormat: 'Referência ou descrição da fonte consultada.' },
  { field: 'confianca_bvoc', label: 'Confiança da classificação BVOC', group: 'Emissões BVOC', expectedFormat: 'Baixa, baixa-média, média ou média-alta.' },
  { field: 'exibir_aviso_bvoc', label: 'Configuração de ressalva BVOC', group: 'Emissões BVOC', expectedFormat: 'Sim (true) ou não (false).', note: 'False é uma escolha explícita; apenas NULL ou campo não retornado aparece como pendência.' },
];

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'string') return false;

  const normalized = value.trim().toLowerCase();
  return normalized === '' || normalized === 'null';
}

export function getTreeQualityIssues(tree: Arvore): TreeQualityIssue[] {
  return TREE_QUALITY_RULES.filter((rule) => isMissing(tree[rule.field]));
}

export function getTreeInformationalGaps(tree: Arvore): TreeInformationField[] {
  return TREE_INFORMATION_FIELDS.filter((field) => isMissing(tree[field.field]));
}

export function summarizeTreeInformation(trees: Arvore[]): TreeInformationSummary {
  const fields = TREE_INFORMATION_FIELDS.map((field) => ({
    field: field.field,
    label: field.label,
    count: trees.reduce((count, tree) => count + (isMissing(tree[field.field]) ? 1 : 0), 0),
    group: field.group,
  })).filter((field) => field.count > 0);

  return {
    totalGaps: fields.reduce((total, field) => total + field.count, 0),
    treesWithGaps: trees.filter((tree) => getTreeInformationalGaps(tree).length > 0).length,
    fields,
  };
}

export function summarizeTreeQuality(trees: Arvore[]): TreeQualitySummary {
  let totalIssues = 0;
  let treesWithEligibilityGaps = 0;
  let treesWithRankingGaps = 0;
  let treesWithoutMappedGaps = 0;

  for (const tree of trees) {
    const issues = getTreeQualityIssues(tree);
    const hasEligibilityGap = issues.some((issue) => issue.impacts.includes('eligibility'));
    const hasRankingGap = issues.some((issue) => issue.impacts.includes('ranking'));

    totalIssues += issues.length;
    if (hasEligibilityGap) treesWithEligibilityGaps += 1;
    if (hasRankingGap) treesWithRankingGaps += 1;
    if (issues.length === 0) treesWithoutMappedGaps += 1;
  }

  return {
    totalTrees: trees.length,
    totalIssues,
    treesWithEligibilityGaps,
    treesWithRankingGaps,
    treesWithoutMappedGaps,
  };
}
