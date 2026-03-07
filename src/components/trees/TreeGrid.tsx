import type { Arvore } from '../../types/tree';
import { TreeCard } from './TreeCard';
import { EmptyState } from '../ui/EmptyState';

interface TreeGridProps {
  trees: Arvore[];
  onSelectTree: (arvore: Arvore) => void;
}

export function TreeGrid({ trees, onSelectTree }: TreeGridProps) {
  if (trees.length === 0) {
    return <EmptyState message="Nenhuma árvore encontrada com estes critérios." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {trees.map(arvore => (
        <TreeCard key={arvore.id} arvore={arvore} onClick={() => onSelectTree(arvore)} />
      ))}
    </div>
  );
}
