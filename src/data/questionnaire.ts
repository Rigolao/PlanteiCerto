export type QuestionType = 'eliminatorio' | 'classificatorio';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  group: 1 | 2 | 3 | 4 | 5 | 6;
  groupLabel: string;
  type: QuestionType;
  text: string;
  helpText?: string;
  options: QuestionOption[];
  multiSelect?: boolean;
  showIf?: { questionId: string; values: string[] };
  subQuestions?: Question[];
}

export const questionnaire: Question[] = [
  // ── GRUPO 1: CRITÉRIOS ELIMINATÓRIOS (Espaço e Interferências) ──
  {
    id: 'q1_1',
    group: 1,
    groupLabel: 'Espaço e Interferências',
    type: 'eliminatorio',
    text: 'Qual a largura total da calçada (m)?',
    options: [
      { value: 'lt_1', label: 'Menos de 1 m' },
      { value: '1_2', label: '1 a 2 m' },
      { value: '2_3', label: '2 a 3 m' },
      { value: '3_4', label: '3 a 4 m' },
      { value: 'gt_4', label: 'Mais de 4 m' },
    ],
  },
  {
    id: 'q1_2',
    group: 1,
    groupLabel: 'Espaço e Interferências',
    type: 'eliminatorio',
    text: 'Qual a largura efetiva da faixa de serviço (m)?',
    helpText: 'Faixa onde a árvore será plantada, entre o meio-fio e a faixa livre.',
    options: [
      { value: 'lt_1', label: 'Menos de 1 m' },
      { value: '1_2', label: '1 a 2 m' },
      { value: '2_3', label: '2 a 3 m' },
      { value: '3_4', label: '3 a 4 m' },
      { value: 'gt_4', label: 'Mais de 4 m' },
    ],
  },
  {
    id: 'q1_3',
    group: 1,
    groupLabel: 'Espaço e Interferências',
    type: 'eliminatorio',
    text: 'É necessário manter faixa livre acessível de 1,20 m (ABNT NBR 9050)?',
    helpText: 'Calçadas com fluxo de pedestres precisam de faixa livre mínima de 1,20 m.',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
    ],
  },
  {
    id: 'q1_4',
    group: 1,
    groupLabel: 'Espaço e Interferências',
    type: 'eliminatorio',
    text: 'Qual a dimensão disponível para o berço/cova (m²)?',
    options: [
      { value: 'lt_1', label: 'Menos de 1 m²' },
      { value: '1_2', label: '1 a 2 m²' },
      { value: 'gt_2', label: 'Mais de 2 m²' },
    ],
  },
  {
    id: 'q1_5',
    group: 1,
    groupLabel: 'Espaço e Interferências',
    type: 'eliminatorio',
    text: 'Existe fiação aérea no local?',
    options: [
      { value: 'nao', label: 'Não há fiação' },
      { value: 'sim_convencional', label: 'Sim, convencional' },
      { value: 'sim_protegida', label: 'Sim, isolada/protegida' },
    ],
  },
  {
    id: 'q1_6',
    group: 1,
    groupLabel: 'Espaço e Interferências',
    type: 'eliminatorio',
    text: 'Qual a distância até a fiação aérea (m)?',
    showIf: { questionId: 'q1_5', values: ['sim_convencional', 'sim_protegida'] },
    options: [
      { value: 'lt_4', label: 'Menos de 4 m' },
      { value: 'gt_4', label: '4 m ou mais' },
    ],
  },
  {
    id: 'q1_7',
    group: 1,
    groupLabel: 'Espaço e Interferências',
    type: 'eliminatorio',
    text: 'Qual o recuo da edificação em relação à calçada?',
    options: [
      { value: 'nenhum', label: 'Sem recuo (construção na divisa)' },
      { value: 'lt_2', label: 'Menos de 2 m' },
      { value: 'gt_2', label: '2 m ou mais' },
    ],
  },
  {
    id: 'q1_8',
    group: 1,
    groupLabel: 'Espaço e Interferências',
    type: 'eliminatorio',
    text: 'Distâncias de segurança',
    subQuestions: [
      {
        id: 'q1_8a',
        group: 1,
        groupLabel: 'Espaço e Interferências',
        type: 'eliminatorio',
        text: 'Qual a distância até a esquina mais próxima (m)?',
        helpText: 'Mínimo recomendado: 6 m (Cartilha de Arborização, p.16).',
        options: [
          { value: 'lt_6', label: 'Menos de 6 m' },
          { value: 'gt_6', label: '6 m ou mais' },
        ],
      },
      {
        id: 'q1_8b',
        group: 1,
        groupLabel: 'Espaço e Interferências',
        type: 'eliminatorio',
        text: 'Qual a distância até o poste de iluminação mais próximo (m)?',
        helpText: 'Mínimo recomendado: 4 m (Cartilha de Arborização, p.16).',
        options: [
          { value: 'lt_4', label: 'Menos de 4 m' },
          { value: 'gt_4', label: '4 m ou mais' },
        ],
      },
      {
        id: 'q1_8c',
        group: 1,
        groupLabel: 'Espaço e Interferências',
        type: 'eliminatorio',
        text: 'Qual a distância até a guia rebaixada (rampa de acessibilidade) mais próxima (m)?',
        helpText: 'Mínimo recomendado: 1,5 m (Cartilha de Arborização, p.16).',
        options: [
          { value: 'lt_1_5', label: 'Menos de 1,5 m' },
          { value: 'gt_1_5', label: '1,5 m ou mais' },
        ],
      },
      {
        id: 'q1_8d',
        group: 1,
        groupLabel: 'Espaço e Interferências',
        type: 'eliminatorio',
        text: 'Qual a distância até a boca-de-lobo ou caixa de inspeção mais próxima (m)?',
        helpText: 'Mínimo recomendado: 1,5 m (Cartilha de Arborização, p.16).',
        options: [
          { value: 'lt_1_5', label: 'Menos de 1,5 m' },
          { value: 'gt_1_5', label: '1,5 m ou mais' },
        ],
      },
    ],
    options: [],
  },

  // ── GRUPO 2: CRITÉRIOS CLASSIFICATÓRIOS (Condições Ecológicas) ──
  {
    id: 'q2_1',
    group: 2,
    groupLabel: 'Condições Ecológicas',
    type: 'classificatorio',
    text: 'Qual a condição de insolação do local?',
    options: [
      { value: 'sol_pleno', label: 'Sol pleno (mais de 6h de sol direto)' },
      { value: 'meia_sombra', label: 'Meia sombra (3 a 6h de sol)' },
      { value: 'sombra', label: 'Sombra (menos de 3h de sol)' },
    ],
  },
  {
    id: 'q2_2',
    group: 2,
    groupLabel: 'Condições Ecológicas',
    type: 'classificatorio',
    text: 'Como é a umidade do solo no local?',
    options: [
      { value: 'seco', label: 'Seco (bem drenado)' },
      { value: 'umido', label: 'Úmido (moderado)' },
      { value: 'encharcado', label: 'Encharcado (alagável)' },
    ],
  },
  {
    id: 'q2_3',
    group: 2,
    groupLabel: 'Condições Ecológicas',
    type: 'classificatorio',
    text: 'Qual a qualidade do solo?',
    options: [
      { value: 'bom', label: 'Bom (solo natural, permeável)' },
      { value: 'ruim', label: 'Ruim (compactado, entulho, aterro)' },
    ],
  },
  {
    id: 'q2_4',
    group: 2,
    groupLabel: 'Condições Ecológicas',
    type: 'classificatorio',
    text: 'Haverá irrigação regular no primeiro ano?',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
    ],
  },

  // ── GRUPO 3: CRITÉRIOS CLASSIFICATÓRIOS (Preferências do Usuário) ──
  {
    id: 'q3_1',
    group: 3,
    groupLabel: 'Preferências',
    type: 'classificatorio',
    text: 'A queda de folhas, flores ou frutos é um problema no local?',
    options: [
      { value: 'sim', label: 'Sim, quero minimizar sujeira' },
      { value: 'nao', label: 'Não, sem restrição' },
    ],
  },
  {
    id: 'q3_2',
    group: 3,
    groupLabel: 'Preferências',
    type: 'classificatorio',
    text: 'A presença de espinhos ou substâncias irritantes é um problema?',
    options: [
      { value: 'sim', label: 'Sim, quero evitar' },
      { value: 'nao', label: 'Não, sem restrição' },
    ],
  },
  {
    id: 'q3_3',
    group: 3,
    groupLabel: 'Preferências',
    type: 'classificatorio',
    text: 'É necessário evitar atração de abelhas ou insetos?',
    options: [
      { value: 'sim', label: 'Sim, quero minimizar' },
      { value: 'nao', label: 'Não, sem restrição' },
    ],
  },
  {
    id: 'q3_4',
    group: 3,
    groupLabel: 'Preferências',
    type: 'classificatorio',
    text: 'Haverá poda profissional periódica?',
    options: [
      { value: 'sim', label: 'Sim, haverá manutenção profissional' },
      { value: 'nao', label: 'Não, manutenção mínima' },
    ],
  },

  // ── GRUPO 4: CONTEXTO E OBJETIVOS ──
  {
    id: 'q4_1',
    group: 4,
    groupLabel: 'Contexto e Objetivos',
    type: 'classificatorio',
    text: 'Qual o tipo de local de plantio?',
    options: [
      { value: 'calcada', label: 'Calçada em frente a lote/residência' },
      { value: 'canteiro_central', label: 'Canteiro central de avenida' },
      { value: 'praca_parque', label: 'Praça ou parque (área interna)' },
      { value: 'rotatorio', label: 'Rotatória ou trevo viário' },
    ],
  },
  {
    id: 'q4_2',
    group: 4,
    groupLabel: 'Contexto e Objetivos',
    type: 'classificatorio',
    text: 'Qual o principal objetivo com a árvore? (escolha até 2)',
    helpText: 'Selecione até 2 opções.',
    multiSelect: true,
    options: [
      { value: 'sombra', label: 'Sombra e conforto térmico' },
      { value: 'embelezamento', label: 'Embelezamento e floração' },
      { value: 'fauna', label: 'Atração de fauna (aves/polinizadores)' },
      { value: 'baixa_manutencao', label: 'Baixa manutenção / pouca sujeira' },
      { value: 'qualidade_ar', label: 'Melhorar qualidade do ar e biodiversidade' },
      { value: 'nativas', label: 'Valorizar espécies nativas da região' },
    ],
  },

  // ── GRUPO 5: PREFERÊNCIAS BOTÂNICAS ──
  {
    id: 'q5_1',
    group: 5,
    groupLabel: 'Preferências Botânicas',
    type: 'classificatorio',
    text: 'Há preferência por espécies nativas do Brasil?',
    options: [
      { value: 'sim', label: 'Sim, priorizar nativas' },
      { value: 'nao', label: 'Não é uma prioridade' },
    ],
  },
  {
    id: 'q5_2',
    group: 5,
    groupLabel: 'Preferências Botânicas',
    type: 'classificatorio',
    text: 'Há preferência por espécies que atraiam fauna (aves, polinizadores)?',
    options: [
      { value: 'sim', label: 'Sim, priorizar' },
      { value: 'nao', label: 'Não é uma prioridade' },
    ],
  },

  // ── GRUPO 6: OUTROS FATORES ──
  {
    id: 'q6_1',
    group: 6,
    groupLabel: 'Outros Fatores',
    type: 'classificatorio',
    text: 'O local é muito exposto a ventos fortes?',
    options: [
      { value: 'sim', label: 'Sim, local ventoso' },
      { value: 'nao', label: 'Não, local abrigado' },
    ],
  },
  {
    id: 'q6_2',
    group: 6,
    groupLabel: 'Outros Fatores',
    type: 'classificatorio',
    text: 'O local sofre com ilha de calor (necessidade de sombra extra)?',
    options: [
      { value: 'sim', label: 'Sim, priorizar espécies com alto potencial de sombra' },
      { value: 'nao', label: 'Não' },
    ],
  },
];

/**
 * Flatten subQuestions into a linear step list for the wizard UI.
 * Parent questions with subQuestions are replaced by their children.
 */
export function flattenQuestions(questions: Question[]): Question[] {
  const result: Question[] = [];
  for (const q of questions) {
    if (q.subQuestions && q.subQuestions.length > 0) {
      result.push(...q.subQuestions);
    } else {
      result.push(q);
    }
  }
  return result;
}
