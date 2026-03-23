type ActiveFilter = {
  label: string;
  onRemove: () => void;
};

interface EmptyStateFiltersProps {
  filters: ActiveFilter[];
  onClearAll: () => void;
}

export function EmptyStateFilters({ filters, onClearAll }: EmptyStateFiltersProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-6">
      {/* Ilustração SVG: árvore com lupa */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-muted-foreground opacity-40"
      >
        {/* Tronco */}
        <rect x="54" y="80" width="12" height="24" rx="4" fill="currentColor" />
        {/* Copa (círculos sobrepostos) */}
        <circle cx="60" cy="52" r="28" fill="currentColor" opacity="0.5" />
        <circle cx="44" cy="64" r="18" fill="currentColor" opacity="0.4" />
        <circle cx="76" cy="64" r="18" fill="currentColor" opacity="0.4" />
        <circle cx="60" cy="38" r="20" fill="currentColor" opacity="0.6" />
        {/* Lupa — círculo */}
        <circle cx="88" cy="32" r="14" stroke="currentColor" strokeWidth="5" />
        {/* Lupa — cabo */}
        <line x1="98" y1="42" x2="110" y2="56" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        {/* X dentro da lupa */}
        <line x1="83" y1="27" x2="93" y2="37" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="93" y1="27" x2="83" y2="37" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {/* Textos */}
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-foreground">Nenhuma árvore encontrada</h3>
        <p className="text-sm text-muted-foreground">Tente remover um dos filtros ativos:</p>
      </div>

      {/* Chips dos filtros ativos */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {filters.map((filter, index) => (
          <button
            key={index}
            onClick={filter.onRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer"
          >
            {filter.label}
            <span className="text-primary/70 font-bold text-base leading-none">×</span>
          </button>
        ))}
      </div>

      {/* Botão limpar tudo */}
      <button
        onClick={onClearAll}
        className="text-sm font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors cursor-pointer border-none bg-transparent"
      >
        Limpar todos os filtros
      </button>
    </div>
  );
}
