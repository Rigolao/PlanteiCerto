import { useState, useMemo } from 'react';
import type { Arvore, FiltroAtributo } from '../types/tree';

export function useTreeFilters(trees: Arvore[]) {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtributo>('todos');

  const filtered = useMemo(() => {
    let result = trees;

    if (termoBusca) {
      const lower = termoBusca.toLowerCase();
      result = result.filter(a => a.nomePopular.toLowerCase().includes(lower));
    }

    if (filtroAtivo !== 'todos') {
      result = result.filter(a => a.atributos[filtroAtivo].nota === 5);
    }

    return result;
  }, [trees, termoBusca, filtroAtivo]);

  return { filtered, termoBusca, setTermoBusca, filtroAtivo, setFiltroAtivo };
}
