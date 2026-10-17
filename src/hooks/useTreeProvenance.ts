import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Arvore } from '../types/tree';
import type { ProvenanceMap, ProvenanceRecord } from '../types/provenance';

const COLUNAS = [
  'campo',
  'variavel',
  'idade_anos',
  'unidade',
  'min_operacional',
  'max_operacional',
  'origem',
  'confianca',
  'metodo',
  'fonte',
  'observacao',
  'valor_alterado_em',
].join(', ');

const EMPTY_MAP: ProvenanceMap = {};

function toNumberOrNull(value: unknown): number | null {
  if (value == null) return null;
  // Number('') e Number('  ') dão 0: texto vazio é ausência de limite, não zero.
  if (typeof value === 'string' && value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Lança em erro ou resposta sem dados: o React Query não deve cachear falha como sucesso vazio. */
async function fetchProvenance(treeId: number): Promise<ProvenanceMap> {
  const { data, error } = await supabase
    .from('tree_value_provenance')
    .select(COLUNAS)
    .eq('tree_id', treeId);

  if (error) throw error;
  if (!data) throw new Error('Consulta de proveniência sem dados');

  const map: ProvenanceMap = {};
  for (const row of data as unknown as ProvenanceRecord[]) {
    map[row.campo as keyof Arvore] = {
      ...row,
      min_operacional: toNumberOrNull(row.min_operacional),
      max_operacional: toNumberOrNull(row.max_operacional),
    };
  }
  return map;
}

export interface TreeProvenanceResult {
  provenance: ProvenanceMap;
  loading: boolean;
  /**
   * true somente quando a consulta resolveu com sucesso (inclusive sem nenhuma linha).
   * false com Supabase ausente, sem `treeId`, carregando ou em erro: nesses casos `provenance` é vazio
   * e a ficha não deve afirmar "Origem não registrada".
   */
  disponivel: boolean;
}

export function useTreeProvenance(treeId: number | null): TreeProvenanceResult {
  const enabled = treeId != null && isSupabaseConfigured();
  const query = useQuery({
    queryKey: ['tree-provenance', treeId],
    queryFn: () => fetchProvenance(treeId as number),
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutos de cache
  });

  // Proveniência é complementar: em erro a ficha segue sem selos (mapa vazio).
  const disponivel = enabled && query.isSuccess;
  return {
    provenance: (disponivel ? query.data : undefined) ?? EMPTY_MAP,
    loading: enabled && query.isLoading,
    disponivel,
  };
}
