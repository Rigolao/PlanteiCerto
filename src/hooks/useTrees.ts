import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { staticTrees } from '../data/trees';
import type { Arvore, Taxonomia, Ecologia, Morfologia, Fenologia, UsoUrbanismo } from '../types/tree';

interface DbTree {
  id: number;
  imagem: string;
  descricao: string;
  taxonomia: Taxonomia;
  ecologia: Ecologia;
  morfologia: Morfologia;
  fenologia: Fenologia;
  uso_urbanismo: UsoUrbanismo;
}

function mapDbToArvore(db: DbTree): Arvore {
  return {
    id: db.id,
    imagem: db.imagem,
    descricao: db.descricao,
    taxonomia: db.taxonomia,
    ecologia: db.ecologia,
    morfologia: db.morfologia,
    fenologia: db.fenologia,
    usoUrbanismo: db.uso_urbanismo,
  };
}

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
      
      return (data as DbTree[]).map(mapDbToArvore);
    },
    staleTime: 1000 * 60 * 15, // 15 minutos de cache
  });

  return { trees, loading };
}
