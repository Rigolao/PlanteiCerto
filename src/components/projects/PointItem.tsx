import { TreePine } from 'lucide-react';
import type { Ponto } from '../../types/project';
import type { Arvore } from '../../types/tree';

interface PointItemProps {
  ponto: Ponto;
  arvore: Arvore | undefined;
  onEdit: () => void;
  onRemove: () => void;
  isSelected?: boolean;
  onClick?: () => void;
}

export function PointItem({ ponto, arvore, onEdit, onRemove, isSelected, onClick }: PointItemProps) {
  return (
    <li
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl p-3 ring-1 ring-inset shadow-sm transition-all group cursor-pointer ${
        isSelected ? 'ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'ring-border bg-card hover:ring-primary/30'
      }`}
    >
      {arvore ? (
        arvore.foto ? (
          <img
            src={arvore.foto}
            alt={arvore.nome_popular}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
            <TreePine size={20} className="text-muted-foreground" />
          </div>
        )
      ) : null}
      <div className="flex-1 min-w-0">
        <span className="font-bold text-foreground text-sm block group-hover:text-primary transition-colors">
          {arvore?.nome_popular || 'Árvore desconhecida'}
        </span>
        <span className="text-muted-foreground text-[11px] block truncate">
          {ponto.observacao || 'Sem observações'}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-2 text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
          title="Editar observação"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-transparent border-none cursor-pointer"
          title="Remover ponto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
        </button>
      </div>
    </li>
  );
}
