import { useState } from 'react';
import type { RecommendedTree, CriteriaSummary, ScoreCriterion } from '../../types/recommendation';
import type { Arvore } from '../../types/tree';
import { TreeDetailModal } from '../trees/TreeDetailModal';
import { TreePine } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../hooks/useFavorites';
import { toast } from 'sonner';

interface ResultScreenProps {
  trees: RecommendedTree[];
  eliminatedCount: number;
  totalCount: number;
  criteriaSummary: CriteriaSummary;
  onRestart: () => void;
  onClose: () => void;
}

function scoreBadgeColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-400';
}

function scoreBarWidth(points: number, maxPoints: number): string {
  return `${Math.round((points / maxPoints) * 100)}%`;
}

function ScoreBreakdownBar({ criterion }: { criterion: ScoreCriterion }) {
  const pct = criterion.maxPoints > 0 ? (criterion.points / criterion.maxPoints) * 100 : 0;
  const barColor = pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground truncate pr-2">{criterion.label}</span>
        <span className="font-semibold text-foreground flex-shrink-0">{criterion.points}/{criterion.maxPoints}</span>
      </div>
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: scoreBarWidth(criterion.points, criterion.maxPoints) }}
        />
      </div>
    </div>
  );
}

export function ResultScreen({ trees, eliminatedCount, totalCount, criteriaSummary, onRestart, onClose }: ResultScreenProps) {
  const [selectedTree, setSelectedTree] = useState<Arvore | null>(null);
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();

  const handleToggleFavorite = (e: React.MouseEvent, treeId: number) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Faça login para favoritar árvores.');
      return;
    }
    toggleFavorite(treeId);
  };

  const hasEliminatory = criteriaSummary.eliminatory.length > 0;
  const hasClassificatory = criteriaSummary.classificatory.length > 0;

  if (trees.length === 0) {
    return (
      <>
        {/* Criteria summary mesmo no estado vazio */}
        {hasEliminatory && (
          <div className="mb-8 bg-card rounded-2xl border border-border p-5">
            <h2 className="text-sm font-bold text-foreground mb-3">Filtros eliminatórios aplicados</h2>
            <div className="flex flex-wrap gap-2">
              {criteriaSummary.eliminatory.map((c) => (
                <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-medium border border-destructive/20">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="text-center py-16">
          <div className="mb-5 flex justify-center"><TreePine size={48} className="text-muted-foreground" /></div>
          <h2 className="text-2xl font-bold text-foreground mb-3 font-display">
            Nenhuma espécie compatível encontrada
          </h2>
          <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
            As condições do local são muito restritivas. Tente ajustar os critérios eliminatórios.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRestart}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm cursor-pointer hover:brightness-110 transition-all"
            >
              Refazer Questionário
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-muted text-muted-foreground font-semibold text-sm cursor-pointer hover:bg-muted/80 transition-all"
            >
              Voltar ao Catálogo
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-1">
          Árvores Recomendadas
        </h1>
        <p className="text-base text-muted-foreground">
          <span className="font-semibold text-primary">{trees.length}</span> espécie{trees.length !== 1 ? 's' : ''} compatíve{trees.length !== 1 ? 'is' : 'l'} de {totalCount} analisada{totalCount !== 1 ? 's' : ''}
          {eliminatedCount > 0 && (
            <span className="text-destructive"> · {eliminatedCount} eliminada{eliminatedCount !== 1 ? 's' : ''} pelos filtros do local</span>
          )}
        </p>
      </div>

      {/* Criteria summary card */}
      {(hasEliminatory || hasClassificatory) && (
        <div className="mb-8 bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-wide">Como as espécies foram avaliadas</h2>

          {hasEliminatory && (
            <div>
              <p className="text-xs font-semibold text-destructive mb-2">Filtros eliminatórios (condições do local)</p>
              <div className="flex flex-wrap gap-2">
                {criteriaSummary.eliminatory.map((c) => (
                  <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-medium border border-destructive/20">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hasClassificatory && (
            <div>
              <p className="text-xs font-semibold text-primary mb-2">Critérios de pontuação (preferências e ecologia)</p>
              <div className="flex flex-wrap gap-2">
                {criteriaSummary.classificatory.map((c) => (
                  <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {trees.map((tree) => (
          <button
            key={tree.id}
            onClick={() => setSelectedTree(tree)}
            className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:ring-1 hover:ring-primary/20 hover:-translate-y-1 transition-all cursor-pointer text-left"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
              {tree.foto ? (
                <img
                  src={tree.foto}
                  alt={tree.nome_popular}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-accent/50 text-primary">
                  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" className="opacity-40">
                    <path d="M24 44V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M24 20C24 20 18 16 14 10C18 8 24 12 24 20Z" fill="currentColor" opacity="0.6"/>
                    <path d="M24 20C24 20 30 16 34 10C30 8 24 12 24 20Z" fill="currentColor" opacity="0.4"/>
                  </svg>
                </div>
              )}
              
              {/* Favorite Button */}
              <button
                onClick={(e) => handleToggleFavorite(e, tree.id)}
                className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200 z-10 ${
                  isFavorite(tree.id)
                    ? 'bg-red-500 text-white shadow-lg scale-100'
                    : 'bg-black/30 text-white/90 hover:bg-black/50 backdrop-blur-sm'
                }`}
                title={isFavorite(tree.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                style={isFavorite(tree.id) ? { animation: 'favorite-pulse 0.3s ease-out' } : undefined}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isFavorite(tree.id) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* Score badge */}
              <div className={`absolute top-3 right-3 w-12 h-12 rounded-full ${scoreBadgeColor(tree.score)} flex flex-col items-center justify-center shadow-lg z-10`}>
                <span className="text-white text-sm font-bold leading-none">{tree.score}</span>
                <span className="text-white/80 text-[9px] leading-none">pts</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-primary text-lg font-bold font-display truncate">
                {tree.nome_popular}
              </h3>
              <p className="text-muted-foreground text-sm italic truncate mb-3">
                {tree.nome_cientifico}
              </p>

              {/* Attributes */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tree.porte_altura_classe && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-medium">
                    Porte {tree.porte_altura_classe}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-medium">
                  {tree.origem}
                </span>
                {tree.altura_adulta_max_m && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-medium">
                    {tree.altura_adulta_max_m}m
                  </span>
                )}
              </div>

              {/* Score breakdown — top 3 criteria */}
              {tree.scoreBreakdown && tree.scoreBreakdown.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Destaques da árvore</p>
                  {tree.scoreBreakdown
                    .filter(c => c.points > 0)
                    .sort((a, b) => b.points - a.points || b.maxPoints - a.maxPoints)
                    .slice(0, 3)
                    .map((c) => (
                      <ScoreBreakdownBar key={c.label} criterion={c} />
                    ))}
                  {tree.scoreBreakdown.filter(c => c.points > 0).length > 3 && (
                    <p className="text-[10px] text-muted-foreground">+{tree.scoreBreakdown.filter(c => c.points > 0).length - 3} outros critérios pontuados</p>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pb-4">
        <button
          onClick={onRestart}
          className="px-8 py-3 rounded-xl bg-muted text-foreground font-semibold text-sm cursor-pointer hover:bg-muted/80 transition-all"
        >
          Refazer Questionário
        </button>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm cursor-pointer hover:brightness-110 transition-all"
        >
          Voltar ao Catálogo
        </button>
      </div>

      <TreeDetailModal
        arvore={selectedTree}
        isOpen={!!selectedTree}
        onClose={() => setSelectedTree(null)}
        isFavorite={selectedTree ? isFavorite(selectedTree.id) : false}
        onToggleFavorite={selectedTree ? () => {
          if (!user) {
            toast.info('Faça login para favoritar árvores.');
            return;
          }
          toggleFavorite(selectedTree.id);
        } : undefined}
      />
    </>
  );
}
