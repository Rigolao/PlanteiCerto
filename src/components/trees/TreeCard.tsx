import type { Arvore } from '../../types/tree';

interface TreeCardProps {
  arvore: Arvore;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  isComparing?: boolean;
  onToggleCompare?: (e: React.MouseEvent) => void;
}

export function TreeCard({ arvore, onClick, isFavorite, onToggleFavorite, isComparing, onToggleCompare }: TreeCardProps) {
  return (
    <article
      onClick={onClick}
      className={`bg-card rounded-2xl ring-1 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative
        ${isComparing ? 'ring-primary border-primary shadow-md' : 'ring-border hover:ring-primary/20'}
      `}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        {arvore.foto ? (
          <img
            src={arvore.foto}
            alt={arvore.nome_popular}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">🌳</span>
            <span className="text-xs text-muted-foreground font-medium">Sem imagem</span>
          </div>
        )}

        {/* Compare Checkbox / Overlay */}
        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(e);
            }}
            className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold backdrop-blur-sm transition-all duration-200 cursor-pointer ${
              isComparing 
                ? 'bg-primary text-white border-primary shadow-lg' 
                : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
            }`}
            title={isComparing ? 'Remover da comparação' : 'Adicionar à comparação'}
          >
            {isComparing ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                <span>Comparando</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                <span>Comparar</span>
              </>
            )}
          </button>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200 ${
              isFavorite
                ? 'bg-red-500 text-white shadow-lg scale-100'
                : 'bg-black/30 text-white/90 hover:bg-black/50 backdrop-blur-sm'
            }`}
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            style={isFavorite ? { animation: 'favorite-pulse 0.3s ease-out' } : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-5 pb-4">
        <h2 className="text-primary text-lg font-bold mb-0.5 font-display">{arvore.nome_popular}</h2>
        <p className="text-muted-foreground text-sm italic mb-4 truncate">{arvore.nome_cientifico}</p>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-primary">📏</span> Altura
            </span>
            <span className="font-semibold text-foreground">
              {arvore.altura_adulta_max_m ? `${arvore.altura_adulta_max_m}m` : '—'} ({arvore.porte_altura_classe ?? 'N/A'})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-primary">🌍</span> Origem
            </span>
            <span className="font-semibold text-foreground">
              {arvore.origem === 'Nativa BR' ? '🇧🇷 Nativa' : '🌏 Exótica'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-primary">🌿</span> Folhagem
            </span>
            <span className="font-semibold text-foreground text-xs">
              {arvore.decidua_perenifolia ?? '—'}
            </span>
          </div>

          {arvore.presenca_espinhos !== null && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-primary">{arvore.presenca_espinhos ? '🔪' : '✨'}</span> Espinhos
              </span>
              <span className="font-semibold text-foreground">
                {arvore.presenca_espinhos ? 'Sim' : 'Não'}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
