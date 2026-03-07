import type { Ponto } from '../../types/project';
import type { Arvore } from '../../types/tree';

interface PointItemProps {
  ponto: Ponto;
  arvore: Arvore | undefined;
  onEdit: () => void;
  onRemove: () => void;
}

export function PointItem({ ponto, arvore, onEdit, onRemove }: PointItemProps) {
  return (
    <li className="flex items-center gap-3 bg-white rounded-xl p-3 ring-1 ring-border shadow-sm hover:ring-primary/30 transition-all group">
      {arvore && (
        <img
          src={arvore.imagem}
          alt={arvore.taxonomia.nomeComum}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <span className="font-bold text-foreground text-sm block group-hover:text-primary transition-colors">
          {arvore?.taxonomia.nomeComum || 'Árvore desconhecida'}
        </span>
        <span className="text-muted-foreground text-[11px] block truncate">
          {ponto.observacao || 'Sem observações'}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-2 text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
          title="Editar observação"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button
          onClick={onRemove}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-transparent border-none cursor-pointer"
          title="Remover ponto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
        </button>
      </div>
    </li>
  );
}
