import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Arvore } from '../types/tree';
import { useTrees } from '../hooks/useTrees';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import { TreeGrid } from '../components/trees/TreeGrid';
import { TreeDetailModal } from '../components/trees/TreeDetailModal';
import { CompareModal } from '../components/trees/CompareModal';
import { TreeCardSkeleton } from '../components/ui/Skeleton';
import { AuthModal } from '../components/auth/AuthModal';
import { EmptyStateFilters } from '../components/ui/EmptyStateFilters';
import type { ActiveFilter } from '../components/ui/EmptyStateFilters';
import { TreesToolbar, defaultAdvancedFilters } from '../components/trees/TreesToolbar';
import type { AdvancedFilters } from '../components/trees/TreesToolbar';
import { TreesCompareBar } from '../components/trees/TreesCompareBar';
import { toast } from 'sonner';
import { Home, Shield, Zap, PersonStanding, Star } from 'lucide-react';

interface TreesPageProps {
  trees: Arvore[];
}

const SKELETON_COUNT = 6;
const ITEMS_PER_PAGE = 6;

export function TreesPage({ trees: externalTrees }: TreesPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { trees: fetchedTrees, loading } = useTrees();
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const trees = fetchedTrees.length > 0 ? fetchedTrees : externalTrees;

  const [selectedTree, setSelectedTree] = useState<Arvore | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [ordenacao, setOrdenacao] = useState('nome_az');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const filteredLengthRef = useRef(0);

  // Compare State
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const showFavoritesOnly = searchParams.get('favoritos') === 'true';

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({ ...defaultAdvancedFilters });

  const activeAdvancedCount = Object.values(advancedFilters).filter(v => v !== '' && v !== false).length;

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (termoBusca) filters.push({ label: `Busca: "${termoBusca}"`, onRemove: () => setTermoBusca('') });
    if (advancedFilters.porte) filters.push({ label: `Porte: ${advancedFilters.porte}`, onRemove: () => setAdvancedFilters(p => ({ ...p, porte: '' })) });
    if (advancedFilters.copa) filters.push({ label: `Copa: ${advancedFilters.copa}`, onRemove: () => setAdvancedFilters(p => ({ ...p, copa: '' })) });
    if (advancedFilters.folhagem) filters.push({ label: `Folhagem: ${advancedFilters.folhagem}`, onRemove: () => setAdvancedFilters(p => ({ ...p, folhagem: '' })) });
    if (advancedFilters.nativas) filters.push({ label: 'Nativas do Brasil', icon: Home, onRemove: () => setAdvancedFilters(p => ({ ...p, nativas: false })) });
    if (advancedFilters.sem_espinhos) filters.push({ label: 'Sem Espinhos', icon: Shield, onRemove: () => setAdvancedFilters(p => ({ ...p, sem_espinhos: false })) });
    if (advancedFilters.compat_fiacao) filters.push({ label: 'Compat. Fiação', icon: Zap, onRemove: () => setAdvancedFilters(p => ({ ...p, compat_fiacao: false })) });
    if (advancedFilters.calcada_segura) filters.push({ label: 'Calçadas Seguras', icon: PersonStanding, onRemove: () => setAdvancedFilters(p => ({ ...p, calcada_segura: false })) });
    if (showFavoritesOnly) filters.push({
      label: 'Apenas favoritos',
      icon: Star,
      onRemove: () => setSearchParams(prev => { const next = new URLSearchParams(prev); next.delete('favoritos'); return next; }),
    });
    return filters;
  }, [termoBusca, advancedFilters, showFavoritesOnly, setSearchParams]);

  const clearAllFilters = () => {
    setTermoBusca('');
    setAdvancedFilters({ ...defaultAdvancedFilters });
    searchParams.delete('favoritos');
    setSearchParams(searchParams);
  };

  const filtered = useMemo(() => {
    let result = trees;
    if (termoBusca) {
      const normalizeStr = (str: string | null | undefined) => 
        (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const lower = normalizeStr(termoBusca);
      
      result = result.filter(
        a =>
          normalizeStr(a.nome_popular).includes(lower) ||
          normalizeStr(a.nome_cientifico).includes(lower)
      );
    }

    if (advancedFilters.nativas) result = result.filter(a => a.origem === 'Nativa BR');
    if (advancedFilters.sem_espinhos) result = result.filter(a => a.presenca_espinhos === false);
    if (advancedFilters.porte) result = result.filter(a => a.porte_altura_classe === advancedFilters.porte);
    if (advancedFilters.copa) result = result.filter(a => a.copa_classe === advancedFilters.copa);
    if (advancedFilters.folhagem) result = result.filter(a => a.decidua_perenifolia === advancedFilters.folhagem);
    if (advancedFilters.compat_fiacao) result = result.filter(a => a.compat_fiacao === 'C');
    if (advancedFilters.calcada_segura) result = result.filter(a => (a.potencial_dano_calcada_1a5 ?? 5) <= 2);
    if (showFavoritesOnly && user) result = result.filter(a => favoriteIds.has(a.id));

    const sorted = [...result];
    if (ordenacao === 'nome_az') {
      sorted.sort((a, b) => a.nome_popular.localeCompare(b.nome_popular, 'pt-BR'));
    } else if (ordenacao === 'nome_za') {
      sorted.sort((a, b) => b.nome_popular.localeCompare(a.nome_popular, 'pt-BR'));
    } else if (ordenacao === 'maior_porte') {
      const ordem: Record<string, number> = { 'Grande': 0, 'Médio': 1, 'Pequeno': 2 };
      sorted.sort((a, b) => (ordem[a.porte_altura_classe ?? ''] ?? 3) - (ordem[b.porte_altura_classe ?? ''] ?? 3));
    } else if (ordenacao === 'menor_porte') {
      const ordem: Record<string, number> = { 'Pequeno': 0, 'Médio': 1, 'Grande': 2 };
      sorted.sort((a, b) => (ordem[a.porte_altura_classe ?? ''] ?? 3) - (ordem[b.porte_altura_classe ?? ''] ?? 3));
    } else if (ordenacao === 'mais_sombra') {
      sorted.sort((a, b) => (b.potencial_sombra_1a5 ?? 0) - (a.potencial_sombra_1a5 ?? 0));
    }

    return sorted;
  }, [trees, termoBusca, advancedFilters, showFavoritesOnly, user, favoriteIds, ordenacao]);

  // Reset visible count whenever filters or sorting change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [termoBusca, advancedFilters, showFavoritesOnly, ordenacao]);

  const filteredVisible = filtered.slice(0, visibleCount);
  filteredLengthRef.current = filtered.length;

  // Cleanup observer on unmount
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  // Callback ref: connects IntersectionObserver when sentinel mounts
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) =>
            c < filteredLengthRef.current ? c + ITEMS_PER_PAGE : c
          );
        }
      },
      { rootMargin: '200px', threshold: 0 }
    );
    observerRef.current.observe(node);
  }, []);

  const handleToggleFavorite = (treeId: number) => {
    if (!user) {
      setAuthModalOpen(true);
      toast.info('Faça login para favoritar árvores.');
      return;
    }
    toggleFavorite(treeId);
  };

  const handleToggleCompare = (treeId: number) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(treeId)) {
        next.delete(treeId);
      } else {
        if (next.size >= 3) {
          toast.error('Você pode comparar no máximo 3 árvores por vez.');
          return prev;
        }
        next.add(treeId);
      }
      return next;
    });
  };

  const toggleFavoritesFilter = () => {
    if (showFavoritesOnly) {
      searchParams.delete('favoritos');
    } else {
      searchParams.set('favoritos', 'true');
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="mb-8 mt-2">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 font-display leading-tight">
          Encontre a árvore <em className="text-primary not-italic font-display italic">certa</em>
        </h1>
        <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
          Descubra as melhores espécies para arborização urbana, com avaliações de impacto nas calçadas, limpeza e clima.
        </p>
      </section>

      {/* Recommendation button */}
      <button
        onClick={() => navigate('/recomendacao')}
        className="mb-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm cursor-pointer hover:brightness-110 hover:shadow-lg transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v1m0 16v1m8.66-13.5l-.87.5M4.21 16l-.87.5M20.66 16l-.87-.5M4.21 8l-.87-.5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
        </svg>
        Encontrar Árvore Recomendada
      </button>

      <TreesToolbar
        termoBusca={termoBusca}
        onTermoBuscaChange={setTermoBusca}
        ordenacao={ordenacao}
        onOrdenacaoChange={setOrdenacao}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={toggleFavoritesFilter}
        favoriteCount={favoriteIds.size}
        user={user}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={setAdvancedFilters}
        activeAdvancedCount={activeAdvancedCount}
      />

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <TreeCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Results count */}
          {filtered.length > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Mostrando <strong className="text-foreground">{Math.min(visibleCount, filtered.length)}</strong> de <strong className="text-foreground">{filtered.length}</strong> árvore{filtered.length !== 1 ? 's' : ''}
            </p>
          )}

          <TreeGrid
            trees={filteredVisible}
            onSelectTree={setSelectedTree}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
            emptyState={
              activeFilters.length > 0
                ? <EmptyStateFilters filters={activeFilters} onClearAll={clearAllFilters} />
                : undefined
            }
          />

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
        </>
      )}

      {/* Detail Modal */}
      <TreeDetailModal
        arvore={selectedTree}
        isOpen={!!selectedTree}
        onClose={() => setSelectedTree(null)}
        isFavorite={selectedTree ? isFavorite(selectedTree.id) : false}
        onToggleFavorite={selectedTree ? () => handleToggleFavorite(selectedTree.id) : undefined}
      />

      <CompareModal
        trees={trees.filter(t => compareIds.has(t.id))}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />

      {/* Floating Compare Action Bar */}
      {compareIds.size > 0 && (
        <TreesCompareBar
          compareCount={compareIds.size}
          onClear={() => setCompareIds(new Set())}
          onCompare={() => setIsCompareModalOpen(true)}
        />
      )}

      {/* Auth Modal for unauthenticated favorite clicks */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
