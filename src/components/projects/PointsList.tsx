import type { Ponto } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { PointItem } from './PointItem';

interface PointsListProps {
  points: Ponto[];
  trees: Arvore[];
  onRemovePoint: (pointId: string) => void;
}

export function PointsList({ points, trees, onRemovePoint }: PointsListProps) {
  return (
    <div className="mt-4">
      <h3 className="text-texto-principal font-bold mb-3">
        {points.length === 0
          ? 'Nenhuma árvore adicionada ainda'
          : `Árvores plantadas (${points.length}):`}
      </h3>
      {points.length > 0 && (
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {points.map(p => (
            <PointItem
              key={p.id}
              ponto={p}
              arvore={trees.find(a => a.id === p.tree_id)}
              onRemove={() => onRemovePoint(p.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
