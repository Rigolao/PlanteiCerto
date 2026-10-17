import type { OrigemValor, ProvenanceRecord } from '../types/provenance';

/** Rótulo único para lacunas de atributo de espécie. Alterar só aqui se o orientador pedir outro texto. */
export const ROTULO_SEM_DADO = 'Não avaliado';

const ROTULOS_ORIGEM: Record<OrigemValor, string> = {
  published_table: 'Publicado (tabela)',
  published_equation: 'Calculado por equação publicada',
  published_description: 'Descrição botânica publicada',
  estimated: 'Estimado',
  estimated_rubric: 'Estimado (rubrica)',
  estimated_taxon_proxy: 'Estimado por táxon próximo',
  retido_da_fase_anterior: 'Fase anterior da homologação',
  consolidado_de_registro_inativo: 'Copiado de registro consolidado',
  sem_dado_admissivel: ROTULO_SEM_DADO,
};

export function origemLabel(origem: OrigemValor): string {
  return ROTULOS_ORIGEM[origem];
}

export type OrigemClasse = 'publicado' | 'calculado' | 'estimado' | 'outro' | 'nao_avaliado';

export function origemClasse(origem: OrigemValor): OrigemClasse {
  switch (origem) {
    case 'published_table':
    case 'published_description':
      return 'publicado';
    case 'published_equation':
      return 'calculado';
    case 'estimated':
    case 'estimated_rubric':
    case 'estimated_taxon_proxy':
      return 'estimado';
    case 'retido_da_fase_anterior':
    case 'consolidado_de_registro_inativo':
      return 'outro';
    case 'sem_dado_admissivel':
      return 'nao_avaliado';
  }
}

/** Formata número em pt-BR com no máximo `casas` decimais, sem zeros à toa. */
function num(valor: number, casas = 2): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: casas });
}

export interface ProjecaoFormatada {
  valor: string;
  faixa?: string;
  faixaTipo?: 'operacional' | 'ponto_publicado';
}

/**
 * Formata um valor de projeção (DAP/altura). A faixa nunca é intervalo de confiança:
 * - NULL → rótulo de lacuna;
 * - publicado com mín = máx → ponto publicado, sem faixa;
 * - mín ≠ máx → faixa operacional (qualquer origem);
 * - só um limite → "mín." / "máx." operacional;
 * - sem proveniência e mín = máx = valor → só o valor.
 */
export function formatProjection(
  value: number | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined,
  unit: string,
  prov?: ProvenanceRecord,
): ProjecaoFormatada {
  if (value == null) return { valor: ROTULO_SEM_DADO };

  const valor = `${num(value)} ${unit}`;

  if (min != null && max != null) {
    if (min === max) {
      if (prov?.origem.startsWith('published_')) return { valor, faixaTipo: 'ponto_publicado' };
      if (min === value) return { valor };
    }
    return { valor, faixa: `${num(min)}–${num(max)} ${unit}`, faixaTipo: 'operacional' };
  }

  if (min != null) return { valor, faixa: `mín. ${num(min)} ${unit}`, faixaTipo: 'operacional' };
  if (max != null) return { valor, faixa: `máx. ${num(max)} ${unit}`, faixaTipo: 'operacional' };
  return { valor };
}
