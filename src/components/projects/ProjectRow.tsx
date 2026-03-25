import { Pencil, Trash2 } from 'lucide-react';
import type { Projeto } from '../../types/project';
import { ProgressRing } from './ProgressRing';

interface ProjectRowProps {
  project: Projeto;
  pointCount: number;
  maxPointCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectRow({ project, pointCount, maxPointCount, onOpen, onEdit, onDelete }: ProjectRowProps) {
  const isEmpty = pointCount === 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      className={`group bg-card rounded-xl p-4 flex items-center gap-4 cursor-pointer border-l-[3px] transition-all duration-150 ease-out
        ${isEmpty ? 'opacity-65 border-l-transparent' : 'border-l-transparent'}
        hover:border-l-primary hover:shadow-sm`}
    >
      <ProgressRing count={pointCount} max={maxPointCount} />

      <div className="flex-1 min-w-0">
        <div className="font-bold text-[15px] text-foreground leading-tight truncate">
          {project.nome}
        </div>
        <div className="text-muted-foreground text-xs mt-1">
          {isEmpty ? (
            <span className="italic">Nenhuma árvore adicionada</span>
          ) : (
            <span>{pointCount} árvore{pointCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Desktop hover actions */}
      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors bg-transparent border-none cursor-pointer"
          title="Editar projeto"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors bg-transparent border-none cursor-pointer"
          title="Excluir projeto"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Mobile: always-visible compact actions */}
      <div className="flex sm:hidden items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
          title="Editar projeto"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors bg-transparent border-none cursor-pointer"
          title="Excluir projeto"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <span className="text-muted-foreground/40 text-xl flex-shrink-0 ml-1">›</span>
    </div>
  );
}
