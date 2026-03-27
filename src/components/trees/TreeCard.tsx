import { memo } from 'react';
import { Ruler, Globe, Leaf, AlertTriangle, CheckCircle, Home } from 'lucide-react';
import type { Arvore } from '../../types/tree';

interface TreeCardProps {
  arvore: Arvore;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  isComparing?: boolean;
  onToggleCompare?: (e: React.MouseEvent) => void;
}

export const TreeCard = memo(function TreeCard({ arvore, onClick, isFavorite, onToggleFavorite, isComparing, onToggleCompare }: TreeCardProps) {
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
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="aspect-[4/3] bg-gradient-to-br from-[#d4e6d5] to-[#a0c4a2] flex items-center justify-center w-full h-full">
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none" className="opacity-40">
              <path d="M24 44V20" stroke="#1a4d2c" strokeWidth="2" strokeLinecap="round"/>
              <path d="M24 20C24 20 18 16 14 10C18 8 24 12 24 20Z" fill="#226437"/>
              <path d="M24 20C24 20 30 16 34 10C30 8 24 12 24 20Z" fill="#2d7a40"/>
              <path d="M24 28C24 28 17 24 13 17C17 14 24 19 24 28Z" fill="#1a5c30"/>
              <path d="M24 28C24 28 31 24 35 17C31 14 24 19 24 28Z" fill="#226437"/>
              <ellipse cx="24" cy="43" rx="5" ry="2" fill="#1a4d2c" opacity="0.2"/>
            </svg>
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
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h2 className="text-primary text-lg font-bold font-display break-words line-clamp-2">{arvore.nome_popular}</h2>
          <span className="shrink-0 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 mt-0.5">
            {arvore.origem === 'Nativa BR' ? <Home size={9} /> : <Globe size={9} />}
            {arvore.origem === 'Nativa BR' ? 'Nativa' : 'Exótica'}
          </span>
        </div>
        <p className="text-muted-foreground text-sm italic mb-4 truncate">{arvore.nome_cientifico}</p>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Ruler size={12} className="text-muted-foreground" /> Altura
            </span>
            <span className="bg-[#e8ede9] text-[#2c4a2e] rounded-full px-2 py-0.5 text-xs font-medium">
              {arvore.altura_adulta_max_m ? `${arvore.altura_adulta_max_m}m` : '—'} ({arvore.porte_altura_classe ?? 'N/A'})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Leaf size={12} className="text-muted-foreground" /> Folhagem
            </span>
            <span className="bg-[#f0e8df] text-[#6b4226] rounded-full px-2 py-0.5 text-xs font-medium">
              {arvore.decidua_perenifolia ?? '—'}
            </span>
          </div>

          {arvore.presenca_espinhos !== null && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {arvore.presenca_espinhos ? <AlertTriangle size={12} /> : <CheckCircle size={12} />} Espinhos
              </span>
              <span className="bg-[#f0e8df] text-[#6b4226] rounded-full px-2 py-0.5 text-xs font-medium">
                {arvore.presenca_espinhos ? 'Sim' : 'Não'}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});
