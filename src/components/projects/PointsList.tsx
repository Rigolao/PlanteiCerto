import { useState } from 'react';
import type { Ponto, PontoPendente } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { PointItem } from './PointItem';
import { Skeleton } from '../ui/Skeleton';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface PointsListProps {
  points: Ponto[];
  loading: boolean;
  trees: Arvore[];
  pendingPoints: PontoPendente[];
  onRemovePoint: (pointId: string) => void;
  onEditPoint: (ponto: Ponto) => void;
  onRemovePendingPoint: (pointId: string) => void;
  onLinkTree: (point: PontoPendente) => void;
  selectedPointId?: string | null;
  onSelectPoint?: (id: string | null) => void;
}

function PointItemSkeleton() {
  return (
    <li className="flex items-center justify-between gap-3 bg-card rounded-xl p-3 ring-1 ring-border">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="w-14 h-7 rounded-lg" />
        <Skeleton className="w-14 h-7 rounded-lg" />
      </div>
    </li>
  );
}

export function PointsList({ points, loading, trees, pendingPoints, onRemovePoint, onEditPoint, onRemovePendingPoint, onLinkTree, selectedPointId, onSelectPoint }: PointsListProps) {
  const [pointToDelete, setPointToDelete] = useState<string | null>(null);

  return (
    <div className="mt-4">
      {/* Pontos Pendentes */}
      {pendingPoints.length > 0 && (
        <div className="mb-6 p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <svg className="text-amber-600" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <h3 className="text-amber-800 font-bold text-sm">
              Pontos Pendentes ({pendingPoints.length})
            </h3>
          </div>
          <p className="text-[11px] text-amber-700/80 mb-4 leading-relaxed">
            Salve esses pontos vinculando-os a uma espécie para que fiquem registrados no projeto.
          </p>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {pendingPoints.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between gap-3 bg-card/80 rounded-xl p-3 border border-amber-100/50">
                <span className="font-medium text-amber-900 text-[11px]">Ponto #{i + 1}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onRemovePendingPoint(p.id)}
                    className="text-amber-700/60 hover:text-red-600 text-[10px] font-bold px-2 py-1 bg-transparent border-none cursor-pointer transition-colors"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => onLinkTree(p)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border-none shadow-sm transition-colors cursor-pointer"
                  >
                    Vincular Árvore
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Título da seção */}
      <h3 className="text-foreground font-bold mb-3">
        {loading
          ? 'Carregando pontos...'
          : points.length === 0
            ? 'Nenhuma árvore salva ainda'
            : `Árvores plantadas e salvas (${points.length}):`}
      </h3>

      {/* Skeleton durante carregamento */}
      {loading ? (
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <PointItemSkeleton key={i} />
          ))}
        </ul>
      ) : points.length > 0 ? (
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {points.map(p => (
            <PointItem
              key={p.id}
              ponto={p}
              arvore={trees.find(a => a.id === p.tree_id)}
              isSelected={selectedPointId === p.id}
              onClick={() => onSelectPoint?.(selectedPointId === p.id ? null : p.id)}
              onEdit={() => onEditPoint(p)}
              onRemove={() => setPointToDelete(p.id)}
            />
          ))}
        </ul>
      ) : null}

      <ConfirmationModal
        isOpen={!!pointToDelete}
        onClose={() => setPointToDelete(null)}
        onConfirm={() => pointToDelete && onRemovePoint(pointToDelete)}
        title="Remover árvore"
        description="Deseja remover esta árvore do seu projeto? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="danger"
      />
    </div>
  );
}
