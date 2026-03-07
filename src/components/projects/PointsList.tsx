import type { Ponto, PontoPendente } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { PointItem } from './PointItem';

interface PointsListProps {
  points: Ponto[];
  trees: Arvore[];
  pendingPoints: PontoPendente[];
  onRemovePoint: (pointId: string) => void;
  onEditPoint: (ponto: Ponto) => void;
  onRemovePendingPoint: (pointId: string) => void;
  onLinkTree: (point: PontoPendente) => void;
}

export function PointsList({ points, trees, pendingPoints, onRemovePoint, onEditPoint, onRemovePendingPoint, onLinkTree }: PointsListProps) {
  return (
    <div className="mt-4">
      {pendingPoints.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-100 rounded-xl border-2 border-yellow-300">
          <h3 className="text-yellow-800 font-bold mb-3 flex items-center gap-2">
            ⚠️ Pontos Pendentes ({pendingPoints.length})
          </h3>
          <p className="text-sm text-yellow-700 mb-4">Esses pontos ainda não foram salvos! Vincule-os a uma árvore.</p>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {pendingPoints.map((p, i) => (
              <li key={p.id} className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/60 rounded-xl p-3 shadow-sm border border-yellow-200">
                <span className="font-medium text-yellow-900 text-sm">Ponto #{i + 1} (Lat: {p.lat.toFixed(4)}, Lng: {p.lng.toFixed(4)})</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onRemovePendingPoint(p.id)}
                    className="flex-1 sm:flex-none text-red-500 hover:bg-red-50 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={() => onLinkTree(p)}
                    className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    Vincular Árvore
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h3 className="text-texto-principal font-bold mb-3">
        {points.length === 0
          ? 'Nenhuma árvore salva ainda'
          : `Árvores plantadas e salvas (${points.length}):`}
      </h3>
      {points.length > 0 && (
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {points.map(p => (
            <PointItem
              key={p.id}
              ponto={p}
              arvore={trees.find(a => a.id === p.tree_id)}
              onEdit={() => onEditPoint(p)}
              onRemove={() => onRemovePoint(p.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
