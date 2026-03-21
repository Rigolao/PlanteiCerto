import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Arvore } from '../types/tree';
import { useTrees } from '../hooks/useTrees';
import { TreeGrid } from '../components/trees/TreeGrid';
import { TreeDetailModal } from '../components/trees/TreeDetailModal';
import { TreeCardSkeleton } from '../components/ui/Skeleton';

interface TreesPageProps {
  trees: Arvore[];
}

const SKELETON_COUNT = 6;

export function TreesPage({ trees: externalTrees }: TreesPageProps) {
  const navigate = useNavigate();
  const { trees: fetchedTrees, loading } = useTrees();
  const trees = fetchedTrees.length > 0 ? fetchedTrees : externalTrees;

  const [selectedTree, setSelectedTree] = useState<Arvore | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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

    return result;
  }, [trees, termoBusca, advancedFilters]);

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

      {/* Search and Advanced Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          <input
            type="text"
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
            placeholder="Buscar por nome ou espécie..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
          />
        </div>

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
                <option value="Grande">🌳 Grande (acima de 12m)</option>
                <option value="Médio">🌲 Médio (6m a 12m)</option>
                <option value="Pequeno">🌿 Pequeno (até 6m)</option>
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
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">🇧🇷 Nativas do Brasil</span>
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
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">🌿 Sem Espinhos</span>
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
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">⚡ Compatível p/ Fiação</span>
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
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">🚶 Calçadas Seguras</span>
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
