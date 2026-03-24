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
import { toast } from 'sonner';
import { Home, Shield, Zap, PersonStanding, Star, Search } from 'lucide-react';

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
  const [ordenacao, setOrdenacao] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const filteredLengthRef = useRef(0);

  // Compare State
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const showFavoritesOnly = searchParams.get('favoritos') === 'true';

  const [advancedFilters, setAdvancedFilters] = useState({
    porte: '',
    copa: '',
    folhagem: '',
    nativas: false,
    sem_espinhos: false,
    compat_fiacao: false,
    calcada_segura: false,
  });

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
    setAdvancedFilters({ porte: '', copa: '', folhagem: '', nativas: false, sem_espinhos: false, compat_fiacao: false, calcada_segura: false });
    searchParams.delete('favoritos');
    setSearchParams(searchParams);
  };

  const filtered = useMemo(() => {
    let result = trees;
    if (termoBusca) {
      const lower = termoBusca.toLowerCase();
      result = result.filter(
        a =>
          a.nome_popular.toLowerCase().includes(lower) ||
          a.nome_cientifico.toLowerCase().includes(lower)
      );
    }
    
    if (advancedFilters.nativas) {
      result = result.filter(a => a.origem === 'Nativa BR');
    }
    if (advancedFilters.sem_espinhos) {
      result = result.filter(a => a.presenca_espinhos === false);
    }
    if (advancedFilters.porte) {
      result = result.filter(a => a.porte_altura_classe === advancedFilters.porte);
    }
    if (advancedFilters.copa) {
      result = result.filter(a => a.copa_classe === advancedFilters.copa);
    }
    if (advancedFilters.folhagem) {
      result = result.filter(a => a.decidua_perenifolia === advancedFilters.folhagem);
    }
    if (advancedFilters.compat_fiacao) {
      result = result.filter(a => a.compat_fiacao === 'C');
    }
    if (advancedFilters.calcada_segura) {
      result = result.filter(a => (a.potencial_dano_calcada_1a5 ?? 5) <= 2);
    }

    // Favorites filter
    if (showFavoritesOnly && user) {
      result = result.filter(a => favoriteIds.has(a.id));
    }

    // Sorting
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
          Encontre a árvore <em className="text-primary not-italic font-display italic">ideal</em>
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
        Encontrar Árvore Ideal
      </button>

      {/* Search, Sort, Favorites Toggle, and Advanced Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 flex-wrap">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
            placeholder="Buscar por nome ou espécie..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Ordenação */}
        <div className="relative flex-shrink-0 w-full sm:w-auto">
          <select
            value={ordenacao}
            onChange={e => setOrdenacao(e.target.value)}
            className={`w-full sm:w-auto pl-3 pr-8 py-2.5 rounded-xl border text-sm font-medium bg-card cursor-pointer focus:outline-none focus:border-primary transition-all appearance-none ${
              ordenacao
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border text-foreground hover:border-primary/40'
            }`}
          >
            <option value="">Ordenar por...</option>
            <option value="nome_az">Nome (A → Z)</option>
            <option value="nome_za">Nome (Z → A)</option>
            <option value="maior_porte">Maior porte primeiro</option>
            <option value="menor_porte">Menor porte primeiro</option>
            <option value="mais_sombra">Mais sombra primeiro</option>
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>
            </svg>
          </span>
        </div>

        {user && (
          <button
            onClick={toggleFavoritesFilter}
            className={`flex-shrink-0 flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer w-full sm:w-auto ${
              showFavoritesOnly
                ? 'bg-red-500/10 text-red-600 border-red-500/40 shadow-sm dark:text-red-400 dark:border-red-400/40'
                : 'bg-card text-foreground border-border hover:border-red-300'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={showFavoritesOnly ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Favoritos
            {favoriteIds.size > 0 && (
              <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                showFavoritesOnly
                  ? 'bg-red-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {favoriteIds.size}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex-shrink-0 flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer w-full sm:w-auto ${
            showAdvanced || activeAdvancedCount > 0
              ? 'bg-primary/10 text-primary border-primary shadow-sm'
              : 'bg-card text-foreground border-border hover:border-primary/40'
          }`}
        >
          Filtros Avançados
          {activeAdvancedCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeAdvancedCount}
            </span>
          )}
        </button>
      </div>



      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-8 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-foreground font-display text-lg">Critérios Específicos</h3>
            {activeAdvancedCount > 0 && (
              <button
                onClick={() => setAdvancedFilters({ porte: '', copa: '', folhagem: '', nativas: false, sem_espinhos: false, compat_fiacao: false, calcada_segura: false })}
                className="text-sm font-semibold text-primary/80 hover:text-primary cursor-pointer border-none bg-transparent p-0 underline underline-offset-4"
              >
                Limpar Todos ({activeAdvancedCount})
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {/* Porte */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Porte da Árvore</label>
              <select
                value={advancedFilters.porte}
                onChange={e => setAdvancedFilters(prev => ({ ...prev, porte: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Qualquer tamanho</option>
                <option value="Grande">Grande (acima de 12m)</option>
                <option value="Médio">Médio (6m a 12m)</option>
                <option value="Pequeno">Pequeno (até 6m)</option>
              </select>
            </div>

            {/* Copa */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Tamanho da Copa</label>
              <select
                value={advancedFilters.copa}
                onChange={e => setAdvancedFilters(prev => ({ ...prev, copa: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Qualquer copa</option>
                <option value="Grande">Grande</option>
                <option value="Média">Média</option>
                <option value="Pequena">Pequena</option>
              </select>
            </div>

            {/* Folhagem */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Tipo de Folhagem</label>
              <select
                value={advancedFilters.folhagem}
                onChange={e => setAdvancedFilters(prev => ({ ...prev, folhagem: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Todas</option>
                <option value="Perenifólia">Perenifólia (Não perde folha)</option>
                <option value="Decídua">Decídua (Perde folhas)</option>
                <option value="Semidecídua">Semidecídua (Perde parcialmente)</option>
              </select>
            </div>
            
            {/* Nativas do Brasil */}
            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${advancedFilters.nativas ? 'bg-primary/10 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/40'}`}>
              <input
                type="checkbox"
                checked={advancedFilters.nativas}
                onChange={e => setAdvancedFilters(prev => ({ ...prev, nativas: e.target.checked }))}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Home size={14} /> Nativas do Brasil</span>
                <span className="text-xs text-muted-foreground">Árvores de origem nacional</span>
              </div>
            </label>

            {/* Sem Espinhos */}
            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${advancedFilters.sem_espinhos ? 'bg-primary/10 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/40'}`}>
              <input
                type="checkbox"
                checked={advancedFilters.sem_espinhos}
                onChange={e => setAdvancedFilters(prev => ({ ...prev, sem_espinhos: e.target.checked }))}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Shield size={14} /> Sem Espinhos</span>
                <span className="text-xs text-muted-foreground">Totalmente livres de espinhos</span>
              </div>
            </label>
            
            {/* Fiação */}
            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${advancedFilters.compat_fiacao ? 'bg-primary/10 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/40'}`}>
              <input
                type="checkbox"
                checked={advancedFilters.compat_fiacao}
                onChange={e => setAdvancedFilters(prev => ({ ...prev, compat_fiacao: e.target.checked }))}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Zap size={14} /> Compatível p/ Fiação</span>
                <span className="text-xs text-muted-foreground">Árvores que não encostam nos fios</span>
              </div>
            </label>

            {/* Calçada Segura */}
            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${advancedFilters.calcada_segura ? 'bg-primary/10 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/40'}`}>
              <input
                type="checkbox"
                checked={advancedFilters.calcada_segura}
                onChange={e => setAdvancedFilters(prev => ({ ...prev, calcada_segura: e.target.checked }))}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5"><PersonStanding size={14} /> Calçadas Seguras</span>
                <span className="text-xs text-muted-foreground">Baixo risco de destruição (Dano 1 ou 2)</span>
              </div>
            </label>
          </div>
        </div>
      )}

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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 pointer-events-none">
          <div className="bg-card/95 backdrop-blur-md border shadow-xl rounded-2xl p-3 flex items-center justify-between gap-4 pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-bottom-5">
            <div className="flex flex-col ml-2">
              <span className="text-sm font-bold text-foreground">
                {compareIds.size} de 3 árvores
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                selecionadas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareIds(new Set())}
                className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                disabled={compareIds.size < 2}
                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 ${
                  compareIds.size >= 2
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                {compareIds.size < 2 ? 'Escolha +' : 'Comparar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for unauthenticated favorite clicks */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
