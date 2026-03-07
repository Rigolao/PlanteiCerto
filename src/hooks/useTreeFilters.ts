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
        a.taxonomia.nomeComum.toLowerCase().includes(lower) || 
        a.taxonomia.nomeBotanico.toLowerCase().includes(lower) ||
        a.taxonomia.outrosNomes.some(n => n.toLowerCase().includes(lower))
      );
    }

    if (filtroAtivo === 'nativas') {
      result = result.filter(a => a.taxonomia.nativa);
    } else if (filtroAtivo === 'paisagismo') {
      result = result.filter(a => a.usoUrbanismo.recomendadoPaisagismo);
    } else if (filtroAtivo === 'sem_espinhos') {
      result = result.filter(a => a.usoUrbanismo.riscos.espinhos === false);
    }

    return result;
  }, [trees, termoBusca, filtroAtivo]);

  return { filtered, termoBusca, setTermoBusca, filtroAtivo, setFiltroAtivo };
}
