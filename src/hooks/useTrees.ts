import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { staticTrees } from '../data/trees';
import type { Arvore } from '../types/tree';

interface DbTree {
  id: number;
  nome_popular: string;
  nome_cientifico: string;
  imagem: string;
  descricao: string;
  altura: string;
  raiz: string;
  espacamento: string;
  compat_nota: number;
  compat_legenda: string;
  compat_sub: string[];
  limpeza_nota: number;
  limpeza_legenda: string;
  limpeza_sub: string[];
  clima_nota: number;
  clima_legenda: string;
  clima_sub: string[];
}

function mapDbToArvore(db: DbTree): Arvore {
  return {
    id: db.id,
    nomePopular: db.nome_popular,
    nomeCientifico: db.nome_cientifico,
    imagem: db.imagem,
    descricao: db.descricao,
    altura: db.altura,
    raiz: db.raiz,
    espacamento: db.espacamento,
    atributos: {
      compatibilidade: { nota: db.compat_nota, legenda: db.compat_legenda, sub: db.compat_sub },
      limpeza: { nota: db.limpeza_nota, legenda: db.limpeza_legenda, sub: db.limpeza_sub },
      clima: { nota: db.clima_nota, legenda: db.clima_legenda, sub: db.clima_sub },
    },
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
