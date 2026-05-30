import { useState, useMemo } from 'react';
import type { Arvore, FiltroAtributo } from '../types/tree';

export function useTreeFilters(trees: Arvore[]) {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtributo>('todos');

  const filtered = useMemo(() => {
    let result = trees;

    if (termoBusca) {
      const normalizeStr = (str: string | null | undefined) => 
        (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const lower = normalizeStr(termoBusca);
      
      result = result.filter(a =>
        normalizeStr(a.nome_popular).includes(lower) ||
        normalizeStr(a.nome_cientifico).includes(lower)
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
