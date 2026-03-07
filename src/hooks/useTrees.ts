import { useState, useEffect } from 'react';
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
  const [trees, setTrees] = useState<Arvore[]>(staticTrees);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const fetchTrees = async () => {
      try {
        const { data, error } = await supabase.from('trees').select('*').order('id');
        if (error || !data || data.length === 0) {
          setTrees(staticTrees);
        } else {
          setTrees((data as DbTree[]).map(mapDbToArvore));
        }
      } catch {
        setTrees(staticTrees);
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, []);

  return { trees, loading };
}
