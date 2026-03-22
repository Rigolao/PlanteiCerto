import type { Arvore } from '../../types/tree';
import { TreeCard } from './TreeCard';
import { EmptyState } from '../ui/EmptyState';

interface TreeGridProps {
  trees: Arvore[];
  onSelectTree: (arvore: Arvore) => void;
  favoriteIds?: Set<number>;
  onToggleFavorite?: (treeId: number) => void;
  compareIds?: Set<number>;
  onToggleCompare?: (treeId: number) => void;
}

export function TreeGrid({ trees, onSelectTree, favoriteIds, onToggleFavorite, compareIds, onToggleCompare }: TreeGridProps) {
  if (trees.length === 0) {
    return <EmptyState message="Nenhuma árvore encontrada com estes critérios." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {trees.map(arvore => (
        <TreeCard
          key={arvore.id}
          arvore={arvore}
          onClick={() => onSelectTree(arvore)}
          isFavorite={favoriteIds?.has(arvore.id)}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(arvore.id) : undefined}
          isComparing={compareIds?.has(arvore.id)}
          onToggleCompare={onToggleCompare ? () => onToggleCompare(arvore.id) : undefined}
        />
      ))}
    </div>
  );
}
