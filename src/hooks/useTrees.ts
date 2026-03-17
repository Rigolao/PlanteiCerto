import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { staticTrees } from '../data/trees';
import type { Arvore } from '../types/tree';

export function useTrees() {
  const { data: trees = staticTrees, isLoading: loading } = useQuery({
    queryKey: ['trees'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        return staticTrees;
      }

      const { data, error } = await supabase.from('trees').select('*').order('id');
      if (error || !data || data.length === 0) {
        return staticTrees;
      }

      return data as Arvore[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutos de cache
  });

  return { trees, loading };
}
