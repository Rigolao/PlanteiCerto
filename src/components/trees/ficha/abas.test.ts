import { describe, expect, it } from 'vitest';
import { staticTrees } from '../../../data/trees';
import type { Arvore } from '../../../types/tree';
import { ABAS_FICHA, CAMPOS_INDICADORES, CAMPOS_PROJECAO, valorParaSelo } from './abas';

/** Campos que a ficha exibia antes das abas (morfologia, tolerâncias, fenologia, urbanismo). */
const CAMPOS_DE_HOJE: (keyof Arvore)[] = [
  'altura_adulta_max_m', 'porte_altura_classe', 'diametro_copa_adulto_max_m', 'copa_classe', 'forma_copa',
  'dap_adulto_max_cm', 'altura_primeira_bifurcacao_m',
  'tolerancia_sol_pleno', 'tolerancia_meia_sombra', 'tolerancia_sombra',
  'tolerancia_seca_1a5', 'tolerancia_encharcamento_1a5', 'tolerancia_poluicao_atmosferica_1a5',
  'tolerancia_compactacao_solo_1a5', 'tolerancia_ventos_fortes_1a5', 'potencial_sujeira_1a5',
  'potencial_dano_calcada_1a5', 'atracao_fauna_1a5', 'potencial_sombra_1a5', 'contribuicao_biodiversidade_1a5',
  'tolerancia_poda_1a5',
  'decidua_perenifolia', 'epoca_floracao', 'epoca_frutificacao',
  'compat_fiacao', 'faixa_serv_min_m_recomendada', 'berco_area_min_m2_recomendada', 'volume_solo_min_m3_recomendado',
  'presenca_espinhos', 'presenca_subst_irritantes',
];

function camposDasAbas(): (keyof Arvore)[] {
  return ABAS_FICHA.flatMap(aba => aba.grupos.flatMap(grupo => grupo.itens.flatMap(item =>
    item.tipo === 'tile' ? item.campos.map(c => c.campo) : [item.campo])));
}

describe('ABAS_FICHA', () => {
  it('lists the five tabs in order', () => {
    expect(ABAS_FICHA.map(aba => aba.id)).toEqual(['geral', 'ambiente', 'urbano', 'beneficios', 'crescimento']);
    expect(ABAS_FICHA.map(aba => aba.rotulo)).toEqual(['Visão geral', 'Ambiente', 'Urbano', 'Benefícios', 'Crescimento']);
    expect(ABAS_FICHA.map(aba => aba.titulo)).toEqual([
      'Visão geral', 'Tolerâncias ecológicas', 'Urbanismo e manutenção', 'Benefícios e fenologia', 'Projeções de crescimento',
    ]);
  });

  it('covers every field shown today exactly once', () => {
    const campos = camposDasAbas();
    expect(CAMPOS_DE_HOJE).toHaveLength(30);
    expect(new Set(campos).size).toBe(campos.length);
    expect([...campos].sort()).toEqual([...CAMPOS_DE_HOJE].sort());
    expect(CAMPOS_PROJECAO).toHaveLength(6);
    expect(CAMPOS_INDICADORES).toHaveLength(5);
  });

  it('marks only sidewalk damage and dirt as higher-is-worse', () => {
    const maiorPior = ABAS_FICHA.flatMap(aba => aba.grupos.flatMap(grupo => grupo.itens))
      .flatMap(item => (item.tipo === 'escala' && item.polaridade === 'maior_pior' ? [item.campo] : []));
    expect(maiorPior.sort()).toEqual(['potencial_dano_calcada_1a5', 'potencial_sujeira_1a5']);
  });
});

describe('valorParaSelo', () => {
  it('treats blank text and a "Não encontrado" first fork as NULL for the seal', () => {
    expect(valorParaSelo({ ...staticTrees[0], forma_copa: '   ' }, 'forma_copa')).toBeNull();
    expect(valorParaSelo({ ...staticTrees[0], altura_primeira_bifurcacao_m: 'Não encontrado' }, 'altura_primeira_bifurcacao_m')).toBeNull();
    expect(valorParaSelo({ ...staticTrees[0], forma_copa: 'Colunar' }, 'forma_copa')).toBe('Colunar');
  });
});
