import { memo } from 'react';

interface TreesCompareBarProps {
  compareCount: number;
  onClear: () => void;
  onCompare: () => void;
}

export const TreesCompareBar = memo(function TreesCompareBar({ compareCount, onClear, onCompare }: TreesCompareBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 pointer-events-none">
      <div className="bg-card/95 backdrop-blur-md border shadow-xl rounded-2xl p-3 flex items-center justify-between gap-4 pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-bottom-5">
        <div className="flex flex-col ml-2">
          <span className="text-sm font-bold text-foreground">
            {compareCount} de 3 árvores
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            selecionadas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar
          </button>
          <button
            onClick={onCompare}
            disabled={compareCount < 2}
            className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 ${
              compareCount >= 2
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            {compareCount < 2 ? 'Escolha +' : 'Comparar'}
          </button>
        </div>
      </div>
    </div>
  );
});
