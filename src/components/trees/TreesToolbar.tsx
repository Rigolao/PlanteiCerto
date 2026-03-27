import type { UserProfile } from '../../types/auth';
import { Home, Shield, Zap, PersonStanding, Search } from 'lucide-react';

export interface AdvancedFilters {
  porte: string;
  copa: string;
  folhagem: string;
  nativas: boolean;
  sem_espinhos: boolean;
  compat_fiacao: boolean;
  calcada_segura: boolean;
}

export const defaultAdvancedFilters: AdvancedFilters = {
  porte: '', copa: '', folhagem: '', nativas: false, sem_espinhos: false, compat_fiacao: false, calcada_segura: false,
};

interface TreesToolbarProps {
  termoBusca: string;
  onTermoBuscaChange: (value: string) => void;
  ordenacao: string;
  onOrdenacaoChange: (value: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoriteCount: number;
  user: UserProfile | null;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  advancedFilters: AdvancedFilters;
  onAdvancedFiltersChange: (filters: AdvancedFilters) => void;
  activeAdvancedCount: number;
}

export function TreesToolbar({
  termoBusca,
  onTermoBuscaChange,
  ordenacao,
  onOrdenacaoChange,
  showFavoritesOnly,
  onToggleFavorites,
  favoriteCount,
  user,
  showAdvanced,
  onToggleAdvanced,
  advancedFilters,
  onAdvancedFiltersChange,
  activeAdvancedCount,
}: TreesToolbarProps) {
  return (
    <>
      {/* Search, Sort, Favorites Toggle, and Advanced Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 flex-wrap">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={termoBusca}
            onChange={e => onTermoBuscaChange(e.target.value)}
            placeholder="Buscar por nome ou espécie..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Ordenacao */}
        <div className="relative flex-shrink-0 w-full sm:w-auto">
          <select
            value={ordenacao}
            onChange={e => onOrdenacaoChange(e.target.value)}
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
            onClick={onToggleFavorites}
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
            {favoriteCount > 0 && (
              <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                showFavoritesOnly
                  ? 'bg-red-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {favoriteCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={onToggleAdvanced}
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
                onClick={() => onAdvancedFiltersChange({ ...defaultAdvancedFilters })}
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
                onChange={e => onAdvancedFiltersChange({ ...advancedFilters, porte: e.target.value })}
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
                onChange={e => onAdvancedFiltersChange({ ...advancedFilters, copa: e.target.value })}
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
                onChange={e => onAdvancedFiltersChange({ ...advancedFilters, folhagem: e.target.value })}
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
                onChange={e => onAdvancedFiltersChange({ ...advancedFilters, nativas: e.target.checked })}
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
                onChange={e => onAdvancedFiltersChange({ ...advancedFilters, sem_espinhos: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Shield size={14} /> Sem Espinhos</span>
                <span className="text-xs text-muted-foreground">Totalmente livres de espinhos</span>
              </div>
            </label>

            {/* Fiacao */}
            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${advancedFilters.compat_fiacao ? 'bg-primary/10 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/40'}`}>
              <input
                type="checkbox"
                checked={advancedFilters.compat_fiacao}
                onChange={e => onAdvancedFiltersChange({ ...advancedFilters, compat_fiacao: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Zap size={14} /> Compatível p/ Fiação</span>
                <span className="text-xs text-muted-foreground">Árvores que não encostam nos fios</span>
              </div>
            </label>

            {/* Calcada Segura */}
            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${advancedFilters.calcada_segura ? 'bg-primary/10 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/40'}`}>
              <input
                type="checkbox"
                checked={advancedFilters.calcada_segura}
                onChange={e => onAdvancedFiltersChange({ ...advancedFilters, calcada_segura: e.target.checked })}
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
    </>
  );
}
