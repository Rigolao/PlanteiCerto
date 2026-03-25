import { useState, useEffect, useRef } from 'react';
import { TreePine, MapPin } from 'lucide-react';
import type { Ponto, PontoPendente } from '../../types/project';
import type { Arvore } from '../../types/tree';
import { PointActionsMenu } from './PointActionsMenu';
import { Skeleton } from '../ui/Skeleton';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface PointsPanelProps {
  points: Ponto[];
  loading: boolean;
  trees: Arvore[];
  pendingPoints: PontoPendente[];
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  onEditPoint: (ponto: Ponto) => void;
  onRemovePoint: (pointId: string) => void;
  onRemovePendingPoint: (id: string) => void;
  onLinkTree: (point: PontoPendente) => void;
  className?: string;
}

function PointSkeleton() {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PointsPanel({
  points,
  loading,
  trees,
  pendingPoints,
  selectedPointId,
  onSelectPoint,
  onEditPoint,
  onRemovePoint,
  onRemovePendingPoint,
  onLinkTree,
  className,
}: PointsPanelProps) {
  const [pointToDelete, setPointToDelete] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPointId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-point-id="${selectedPointId}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedPointId]);

  const isEmpty = !loading && points.length === 0 && pendingPoints.length === 0;

  return (
    <div className={`flex flex-col h-full ${className ?? ''}`}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-separator flex items-center gap-2">
        <TreePine size={16} className="text-primary flex-shrink-0" />
        <span className="font-semibold text-sm text-foreground flex-1">Pontos do Projeto</span>
        <span className="text-xs text-muted-foreground font-medium">
          {points.length} {points.length === 1 ? 'salvo' : 'salvos'}
        </span>
      </div>

      {/* Pending section */}
      {pendingPoints.length > 0 && (
        <div className="flex-shrink-0 border-b border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-500 mb-1.5">
            Aguardando vinculação
          </p>
          {pendingPoints.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-white/60 dark:bg-card/60 rounded-lg p-2.5 border border-amber-100/60 dark:border-amber-800/20"
            >
              <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin size={13} className="text-amber-600 dark:text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground text-xs">Ponto #{i + 1}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onRemovePendingPoint(p.id)}
                  className="text-muted-foreground hover:text-destructive text-[10px] font-bold px-2 py-1 bg-transparent border-none cursor-pointer transition-colors rounded hover:bg-destructive/10"
                >
                  Descartar
                </button>
                <button
                  onClick={() => onLinkTree(p)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border-none shadow-sm transition-colors cursor-pointer"
                >
                  Vincular
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved points list */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {loading ? (
          <>
            <PointSkeleton />
            <PointSkeleton />
            <PointSkeleton />
            <PointSkeleton />
          </>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <TreePine size={22} className="text-primary/50" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Nenhuma árvore plantada ainda</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clique no mapa para adicionar pontos de plantio ao seu projeto.
            </p>
          </div>
        ) : (
          points.map((point) => {
            const arvore = trees.find((a) => a.id === point.tree_id);
            const isSelected = selectedPointId === point.id;
            const isNativa = arvore?.origem === 'Nativa BR';

            return (
              <div
                key={point.id}
                data-point-id={point.id}
                onClick={() => onSelectPoint(isSelected ? null : point.id)}
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer border-l-[3px] transition-all duration-150
                  ${isSelected
                    ? 'border-l-blue-500 bg-blue-500/[0.06]'
                    : 'border-l-transparent hover:bg-muted/40'
                  } border-b border-separator`}
              >
                {arvore?.foto ? (
                  <img
                    src={arvore.foto}
                    alt={arvore.nome_popular}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TreePine size={16} className="text-primary/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-xs leading-tight truncate ${isSelected ? 'text-blue-500' : 'text-foreground'}`}>
                    {arvore?.nome_popular || 'Desconhecida'}
                  </div>
                  {arvore?.nome_cientifico && (
                    <div className="text-[10px] text-muted-foreground italic truncate mt-0.5">
                      {arvore.nome_cientifico}
                    </div>
                  )}
                  <div className="flex gap-1 mt-1">
                    {arvore?.origem && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isNativa
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {isNativa ? 'Nativa' : 'Exótica'}
                      </span>
                    )}
                    {arvore?.porte_altura_classe && (
                      <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {arvore.porte_altura_classe}
                      </span>
                    )}
                  </div>
                </div>
                <PointActionsMenu
                  onEdit={() => onEditPoint(point)}
                  onRemove={() => setPointToDelete(point.id)}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Delete confirmation modal */}
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
