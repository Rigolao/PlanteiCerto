import { Building2, Leaf, ShieldCheck, TreeDeciduous, TrendingUp, type LucideIcon } from 'lucide-react';
import type { Arvore } from '../../../types/tree';
import type { Polaridade } from '../../../lib/escala';
import { ROTULO_SEM_DADO } from '../../../lib/provenance';
import { formatBifurcacao, formatMedida, formatMedidaClasse, formatTexto } from '../../../lib/format';

export type AbaId = 'geral' | 'ambiente' | 'urbano' | 'beneficios' | 'crescimento';

/** Campo que tem selo de origem dentro de um item. O primeiro de cada tile é o principal (`data-campo`). */
export interface CampoSelo {
  campo: keyof Arvore;
  rotulo: string;
}

export type ItemFicha =
  | { tipo: 'tile'; rotulo: string; campos: CampoSelo[]; valor: (a: Arvore) => string }
  | { tipo: 'escala'; rotulo: string; campo: keyof Arvore; polaridade: Polaridade; dica?: string };

export interface GrupoFicha {
  titulo: string;
  layout: 'tiles' | 'escalas';
  colunas: string;
  itens: ItemFicha[];
}

export interface AbaFicha {
  id: AbaId;
  rotulo: string;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  grupos: GrupoFicha[];
}

/** Constante da planilha de projeção do orientador, igual para todas as espécies. */
export const CENARIO_PROJECAO = 'Muda de DAP 3 cm e altura 1,5 m, plantada em boas condições.';

export const HORIZONTES_PROJECAO = [
  {
    label: '10 anos',
    dap: 'dap_10a_cm',
    dapMin: 'dap_10a_min_cm',
    dapMax: 'dap_10a_max_cm',
    altura: 'altura_10a_m',
    alturaMin: 'altura_10a_min_m',
    alturaMax: 'altura_10a_max_m',
  },
  {
    label: '20 anos',
    dap: 'dap_20a_cm',
    dapMin: 'dap_20a_min_cm',
    dapMax: 'dap_20a_max_cm',
    altura: 'altura_20a_m',
    alturaMin: 'altura_20a_min_m',
    alturaMax: 'altura_20a_max_m',
  },
  {
    label: '30 anos',
    dap: 'dap_30a_cm',
    dapMin: 'dap_30a_min_cm',
    dapMax: 'dap_30a_max_cm',
    altura: 'altura_30a_m',
    alturaMin: 'altura_30a_min_m',
    alturaMax: 'altura_30a_max_m',
  },
] as const;

/** As 6 células da tabela de projeção (DAP e altura aos 10, 20 e 30 anos). */
export const CAMPOS_PROJECAO: (keyof Arvore)[] = [
  ...HORIZONTES_PROJECAO.map(h => h.dap),
  ...HORIZONTES_PROJECAO.map(h => h.altura),
];

/** Indicadores em 10 anos; cada tile só aparece quando o valor existe. */
export const CAMPOS_INDICADORES: (keyof Arvore)[] = [
  'biomassa_aerea_10a_kg',
  'carbono_armazenado_10a_kg',
  'co2e_10a_kg',
  'sobrevivencia_10a_pct',
  'co2e_esperado_por_muda_10a_kg',
];

/** Texto que a ficha exibe como lacuna (NULL, vazio, "Não encontrado") conta como NULL para o selo. */
export function textoOuNull(valor: string | null | undefined, formatado: string): string | null {
  return formatado === ROTULO_SEM_DADO ? null : valor ?? null;
}

function bifurcacaoBruta(a: Arvore): string | null {
  return a.altura_primeira_bifurcacao_m ?? a.altura_primeira_bifurcacao_faixa ?? null;
}

/** Valor que decide o selo: texto vazio, só espaços ou "Não encontrado" (na bifurcação) conta como NULL. */
export function valorParaSelo(a: Arvore, campo: keyof Arvore): unknown {
  if (campo === 'altura_primeira_bifurcacao_m') {
    const bruto = bifurcacaoBruta(a);
    return textoOuNull(bruto, formatBifurcacao(bruto));
  }
  const valor = a[campo];
  if (typeof valor === 'string') return textoOuNull(valor, formatTexto(valor));
  return valor ?? null;
}

function simNao(valor: boolean | null): string {
  if (valor == null) return ROTULO_SEM_DADO;
  return valor ? 'Sim' : 'Não';
}

function fiacao(valor: Arvore['compat_fiacao']): string {
  if (valor === 'N') return 'Incompatível';
  if (valor === 'A') return 'Compatível c/ Alta Tensão';
  if (valor === 'C') return 'Compatível';
  return ROTULO_SEM_DADO;
}

const COLUNAS_ESCALAS = 'grid-cols-1 sm:grid-cols-2';
const DICA_MAIOR_PIOR = 'potencial; quanto maior, pior';

export const ABAS_FICHA: AbaFicha[] = [
  {
    id: 'geral',
    rotulo: 'Visão geral',
    titulo: 'Visão geral',
    descricao: 'Tamanho, forma e restrições que dizem se a espécie cabe no local.',
    icone: TreeDeciduous,
    grupos: [
      {
        titulo: 'Tamanho e forma',
        layout: 'tiles',
        colunas: 'grid-cols-2 sm:grid-cols-4',
        itens: [
          {
            tipo: 'tile',
            rotulo: 'Altura adulta (porte)',
            campos: [{ campo: 'altura_adulta_max_m', rotulo: 'Altura adulta' }, { campo: 'porte_altura_classe', rotulo: 'Porte' }],
            valor: a => formatMedidaClasse(a.altura_adulta_max_m, 'm', a.porte_altura_classe),
          },
          {
            tipo: 'tile',
            rotulo: 'Copa (diâmetro e classe)',
            campos: [{ campo: 'diametro_copa_adulto_max_m', rotulo: 'Diâmetro da copa' }, { campo: 'copa_classe', rotulo: 'Classe da copa' }],
            valor: a => formatMedidaClasse(a.diametro_copa_adulto_max_m, 'm', a.copa_classe),
          },
          { tipo: 'tile', rotulo: 'Forma da copa', campos: [{ campo: 'forma_copa', rotulo: 'Forma da copa' }], valor: a => formatTexto(a.forma_copa) },
          { tipo: 'tile', rotulo: 'Folhagem', campos: [{ campo: 'decidua_perenifolia', rotulo: 'Folhagem' }], valor: a => formatTexto(a.decidua_perenifolia) },
        ],
      },
      {
        titulo: 'Fiação e segurança',
        layout: 'tiles',
        colunas: 'grid-cols-2 sm:grid-cols-4',
        itens: [
          { tipo: 'tile', rotulo: 'Rede elétrica (fiação)', campos: [{ campo: 'compat_fiacao', rotulo: 'Fiação' }], valor: a => fiacao(a.compat_fiacao) },
          { tipo: 'tile', rotulo: 'Espinhos', campos: [{ campo: 'presenca_espinhos', rotulo: 'Espinhos' }], valor: a => simNao(a.presenca_espinhos) },
        ],
      },
    ],
  },
  {
    id: 'ambiente',
    rotulo: 'Ambiente',
    titulo: 'Tolerâncias ecológicas',
    descricao: 'Condições do local que a espécie suporta.',
    icone: ShieldCheck,
    grupos: [
      {
        titulo: 'Luz',
        layout: 'tiles',
        colunas: 'grid-cols-3',
        itens: [
          { tipo: 'tile', rotulo: 'Sol pleno', campos: [{ campo: 'tolerancia_sol_pleno', rotulo: 'Sol pleno' }], valor: a => simNao(a.tolerancia_sol_pleno) },
          { tipo: 'tile', rotulo: 'Meia sombra', campos: [{ campo: 'tolerancia_meia_sombra', rotulo: 'Meia sombra' }], valor: a => simNao(a.tolerancia_meia_sombra) },
          { tipo: 'tile', rotulo: 'Sombra', campos: [{ campo: 'tolerancia_sombra', rotulo: 'Sombra' }], valor: a => simNao(a.tolerancia_sombra) },
        ],
      },
      {
        titulo: 'Tolerância de 1 a 5 (quanto maior, mais tolera)',
        layout: 'escalas',
        colunas: COLUNAS_ESCALAS,
        itens: [
          { tipo: 'escala', rotulo: 'Seca', campo: 'tolerancia_seca_1a5', polaridade: 'maior_melhor' },
          { tipo: 'escala', rotulo: 'Encharcamento', campo: 'tolerancia_encharcamento_1a5', polaridade: 'maior_melhor' },
          { tipo: 'escala', rotulo: 'Poluição atmosférica', campo: 'tolerancia_poluicao_atmosferica_1a5', polaridade: 'maior_melhor' },
          { tipo: 'escala', rotulo: 'Compactação do solo', campo: 'tolerancia_compactacao_solo_1a5', polaridade: 'maior_melhor' },
          { tipo: 'escala', rotulo: 'Ventos fortes', campo: 'tolerancia_ventos_fortes_1a5', polaridade: 'maior_melhor' },
        ],
      },
    ],
  },
  {
    id: 'urbano',
    rotulo: 'Urbano',
    titulo: 'Urbanismo e manutenção',
    descricao: 'Espaço que a espécie exige na calçada, riscos e manejo.',
    icone: Building2,
    grupos: [
      {
        titulo: 'Espaço mínimo recomendado',
        layout: 'tiles',
        colunas: 'grid-cols-2 sm:grid-cols-3',
        itens: [
          {
            tipo: 'tile',
            rotulo: 'Faixa de serviço mín.',
            campos: [{ campo: 'faixa_serv_min_m_recomendada', rotulo: 'Faixa de serviço' }],
            valor: a => formatMedida(a.faixa_serv_min_m_recomendada, 'm'),
          },
          {
            tipo: 'tile',
            rotulo: 'Berço mín.',
            campos: [{ campo: 'berco_area_min_m2_recomendada', rotulo: 'Berço' }],
            valor: a => formatMedida(a.berco_area_min_m2_recomendada, 'm²'),
          },
          {
            tipo: 'tile',
            rotulo: 'Volume de solo mín.',
            campos: [{ campo: 'volume_solo_min_m3_recomendado', rotulo: 'Volume de solo' }],
            valor: a => formatMedida(a.volume_solo_min_m3_recomendado, 'm³'),
          },
        ],
      },
      {
        titulo: 'Tronco e segurança',
        layout: 'tiles',
        colunas: 'grid-cols-2 sm:grid-cols-3',
        itens: [
          { tipo: 'tile', rotulo: 'DAP adulto', campos: [{ campo: 'dap_adulto_max_cm', rotulo: 'DAP adulto' }], valor: a => formatMedida(a.dap_adulto_max_cm, 'cm') },
          {
            tipo: 'tile',
            rotulo: '1ª bifurcação',
            campos: [{ campo: 'altura_primeira_bifurcacao_m', rotulo: '1ª bifurcação' }],
            valor: a => formatBifurcacao(bifurcacaoBruta(a)),
          },
          {
            tipo: 'tile',
            rotulo: 'Substâncias irritantes',
            campos: [{ campo: 'presenca_subst_irritantes', rotulo: 'Substâncias irritantes' }],
            valor: a => simNao(a.presenca_subst_irritantes),
          },
        ],
      },
      {
        titulo: 'Riscos e manejo, de 1 a 5',
        layout: 'escalas',
        colunas: COLUNAS_ESCALAS,
        itens: [
          { tipo: 'escala', rotulo: 'Dano à calçada', campo: 'potencial_dano_calcada_1a5', polaridade: 'maior_pior', dica: DICA_MAIOR_PIOR },
          { tipo: 'escala', rotulo: 'Sujeira', campo: 'potencial_sujeira_1a5', polaridade: 'maior_pior', dica: DICA_MAIOR_PIOR },
          { tipo: 'escala', rotulo: 'Tolerância à poda', campo: 'tolerancia_poda_1a5', polaridade: 'maior_melhor', dica: 'quanto maior, mais tolera' },
        ],
      },
    ],
  },
  {
    id: 'beneficios',
    rotulo: 'Benefícios',
    titulo: 'Benefícios e fenologia',
    descricao: 'O que a árvore oferece e quando floresce e frutifica.',
    icone: Leaf,
    grupos: [
      {
        titulo: 'Benefícios de 1 a 5 (quanto maior, melhor)',
        layout: 'escalas',
        colunas: COLUNAS_ESCALAS,
        itens: [
          { tipo: 'escala', rotulo: 'Potencial de sombra', campo: 'potencial_sombra_1a5', polaridade: 'maior_melhor' },
          { tipo: 'escala', rotulo: 'Atração de fauna', campo: 'atracao_fauna_1a5', polaridade: 'maior_melhor' },
          { tipo: 'escala', rotulo: 'Contribuição à biodiversidade', campo: 'contribuicao_biodiversidade_1a5', polaridade: 'maior_melhor' },
        ],
      },
      {
        titulo: 'Fenologia',
        layout: 'tiles',
        colunas: 'grid-cols-2',
        itens: [
          { tipo: 'tile', rotulo: 'Floração', campos: [{ campo: 'epoca_floracao', rotulo: 'Floração' }], valor: a => formatTexto(a.epoca_floracao) },
          { tipo: 'tile', rotulo: 'Frutificação', campos: [{ campo: 'epoca_frutificacao', rotulo: 'Frutificação' }], valor: a => formatTexto(a.epoca_frutificacao) },
        ],
      },
    ],
  },
  {
    id: 'crescimento',
    rotulo: 'Crescimento',
    titulo: 'Projeções de crescimento',
    descricao: CENARIO_PROJECAO,
    icone: TrendingUp,
    grupos: [],
  },
];
