import { describe, expect, it } from 'vitest';
import { staticTrees } from '../data/trees';
import type { Arvore } from '../types/tree';
import type { OrigemValor, ProvenanceRecord } from '../types/provenance';
import { contarOrigens } from './resumoOrigem';

function prov(campo: string, origem: OrigemValor): ProvenanceRecord {
  return {
    campo, variavel: null, idade_anos: null, unidade: null, min_operacional: null, max_operacional: null,
    origem, confianca: null, metodo: null, fonte: null, observacao: null, valor_alterado_em: null,
  };
}

const INDICADORES_NULL = {
  biomassa_aerea_10a_kg: null,
  carbono_armazenado_10a_kg: null,
  co2e_10a_kg: null,
  sobrevivencia_10a_pct: null,
  co2e_esperado_por_muda_10a_kg: null,
};

const PROJECOES_NULL = {
  dap_10a_cm: null, dap_20a_cm: null, dap_30a_cm: null,
  altura_10a_m: null, altura_20a_m: null, altura_30a_m: null,
};

function soma(contagem: Partial<Record<string, number>>): number {
  return Object.values(contagem).reduce<number>((total, n) => total + (n ?? 0), 0);
}

describe('contarOrigens', () => {
  it('returns null when provenance is unavailable', () => {
    expect(contarOrigens(staticTrees[0], {}, false)).toBeNull();
  });

  it('counts records by origin class, filled values without record as sem_registro and NULLs as nao_avaliado', () => {
    const arvore: Arvore = {
      ...staticTrees[0],
      ...INDICADORES_NULL,
      biomassa_aerea_10a_kg: 12,
      tolerancia_seca_1a5: 2,
      tolerancia_encharcamento_1a5: 3,
      compat_fiacao: null,
    };
    const contagem = contarOrigens(arvore, { tolerancia_seca_1a5: prov('tolerancia_seca_1a5', 'published_table') }, true);

    expect(contagem).not.toBeNull();
    expect(contagem?.publicado ?? 0).toBeGreaterThanOrEqual(1);
    expect(contagem?.sem_registro ?? 0).toBeGreaterThanOrEqual(1);
    expect(contagem?.nao_avaliado ?? 0).toBeGreaterThanOrEqual(1);
    expect(soma(contagem ?? {})).toBe(30 + 6 + 1);
  });

  it('counts both fields of a two-field tile', () => {
    const arvore: Arvore = { ...staticTrees[0], diametro_copa_adulto_max_m: 12, copa_classe: 'Grande' };
    const contagem = contarOrigens(arvore, {
      diametro_copa_adulto_max_m: prov('diametro_copa_adulto_max_m', 'estimated_taxon_proxy'),
      copa_classe: prov('copa_classe', 'estimated'),
    }, true);

    expect(contagem?.estimado).toBe(2);
  });

  it('counts NULL projection cells and skips NULL indicators', () => {
    const tudoNull = Object.fromEntries(Object.keys(staticTrees[0])
      .filter(campo => campo !== 'id' && campo !== 'nome_popular' && campo !== 'nome_cientifico' && campo !== 'origem')
      .map(campo => [campo, null]));
    const arvore = { ...staticTrees[0], ...tudoNull, ...PROJECOES_NULL, ...INDICADORES_NULL } as Arvore;
    const contagem = contarOrigens(arvore, {}, true);

    expect(contagem).toEqual({ nao_avaliado: 30 + 6 });
  });

  it('counts a rubric record as estimado and keeps the two "other" origins apart', () => {
    const arvore: Arvore = { ...staticTrees[0], ...INDICADORES_NULL, tolerancia_seca_1a5: 3, biomassa_aerea_10a_kg: 10.6, forma_copa: 'Colunar' };
    const contagem = contarOrigens(arvore, {
      tolerancia_seca_1a5: prov('tolerancia_seca_1a5', 'estimated_rubric'),
      biomassa_aerea_10a_kg: prov('biomassa_aerea_10a_kg', 'retido_da_fase_anterior'),
      forma_copa: prov('forma_copa', 'consolidado_de_registro_inativo'),
    }, true);

    expect(contagem?.estimado).toBe(1);
    expect(contagem?.fase_anterior).toBe(1);
    expect(contagem?.consolidado).toBe(1);
  });
});
