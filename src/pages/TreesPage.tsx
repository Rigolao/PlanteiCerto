import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Arvore, FiltroAtributo } from '../types/tree';
import { useTrees } from '../hooks/useTrees';
import { TreeGrid } from '../components/trees/TreeGrid';
import { TreeDetailModal } from '../components/trees/TreeDetailModal';
import { TreeCardSkeleton } from '../components/ui/Skeleton';

interface TreesPageProps {
  trees: Arvore[];
}

const SKELETON_COUNT = 6;

const filters: { key: FiltroAtributo; label: string; icon: string }[] = [
  { key: 'todos', label: 'Todas', icon: '≡' },
  { key: 'nativas', label: 'Nativas do Brasil', icon: '🇧🇷' },
  { key: 'sem_espinhos', label: 'Sem Espinhos', icon: '🌿' },
];

export function TreesPage({ trees: externalTrees }: TreesPageProps) {
  const navigate = useNavigate();
  const { trees: fetchedTrees, loading } = useTrees();
  // Usa as árvores do hook interno; as externas são fallback até carregar
  const trees = fetchedTrees.length > 0 ? fetchedTrees : externalTrees;

  const [selectedTree, setSelectedTree] = useState<Arvore | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtributo>('todos');

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
    if (filtroAtivo === 'nativas') {
      result = result.filter(a => a.origem === 'Nativa BR');
    } else if (filtroAtivo === 'sem_espinhos') {
      result = result.filter(a => a.presenca_espinhos === false);
    }
    return result;
  }, [trees, termoBusca, filtroAtivo]);

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

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          <input
            type="text"
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
            placeholder="Buscar por nome ou espécie..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltroAtivo(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border ${
              filtroAtivo === f.key
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-foreground border-border hover:border-primary/40'
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <TreeCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <TreeGrid trees={filtered} onSelectTree={setSelectedTree} />
      )}

      {/* Detail Modal */}
      <TreeDetailModal
        arvore={selectedTree}
        isOpen={!!selectedTree}
        onClose={() => setSelectedTree(null)}
      />
    </>
  );
}
