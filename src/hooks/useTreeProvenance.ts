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
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function fetchProvenance(treeId: number): Promise<ProvenanceMap> {
  try {
    const { data, error } = await supabase
      .from('tree_value_provenance')
      .select(COLUNAS)
      .eq('tree_id', treeId);

    if (error || !data) return {};

    const map: ProvenanceMap = {};
    for (const row of data as unknown as ProvenanceRecord[]) {
      map[row.campo as keyof Arvore] = {
        ...row,
        min_operacional: toNumberOrNull(row.min_operacional),
        max_operacional: toNumberOrNull(row.max_operacional),
      };
    }
    return map;
  } catch {
    // Proveniência é complementar: a ficha segue sem selos se a consulta falhar.
    return {};
  }
}

export function useTreeProvenance(treeId: number | null): { provenance: ProvenanceMap; loading: boolean } {
  const enabled = treeId != null && isSupabaseConfigured();
  const query = useQuery({
    queryKey: ['tree-provenance', treeId],
    queryFn: () => fetchProvenance(treeId as number),
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutos de cache
  });

  return { provenance: query.data ?? EMPTY_MAP, loading: enabled && query.isLoading };
}
