import { useState, useMemo } from 'react';
import type { Arvore, FiltroAtributo } from '../types/tree';

export function useTreeFilters(trees: Arvore[]) {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtributo>('todos');

  const filtered = useMemo(() => {
    let result = trees;

    if (termoBusca) {
      const lower = termoBusca.toLowerCase();
      result = result.filter(a =>
        a.nome_popular.toLowerCase().includes(lower) ||
        a.nome_cientifico.toLowerCase().includes(lower)
      );
    }

    if (filtroAtivo === 'nativas') {
      result = result.filter(a => a.origem === 'Nativa BR');
    } else if (filtroAtivo === 'sem_espinhos') {
      result = result.filter(a => a.presenca_espinhos === false);
    }

    return result;
  }, [trees, termoBusca, filtroAtivo]);

  return { filtered, termoBusca, setTermoBusca, filtroAtivo, setFiltroAtivo };
}
