import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Arvore } from '../types/tree';

export type AdminTreeQualityError = 'not-configured' | 'load-failed' | null;

export function useAdminTreeQuality() {
  const isConfigured = isSupabaseConfigured();
  const query = useQuery<Arvore[]>({
    queryKey: ['admin-tree-quality'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Arvore[];
    },
    enabled: isConfigured,
    staleTime: 60 * 1000,
  });

  const error: AdminTreeQualityError = !isConfigured
    ? 'not-configured'
    : query.isError
      ? 'load-failed'
      : null;

  return {
    trees: query.data ?? [],
    isLoading: isConfigured && query.isLoading,
    isConfigured,
    error,
    retry: () => { void query.refetch(); },
  };
}
