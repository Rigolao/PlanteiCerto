import type { Projeto } from '../../types/project';

interface ProjectCardProps {
  project: Projeto;
  pointCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, pointCount, onOpen, onEdit, onDelete }: ProjectCardProps) {
  const data = new Date(project.created_at).toLocaleDateString('pt-BR');

  return (
    <div className="bg-card rounded-2xl ring-1 ring-border p-6 transition-all hover:shadow-lg hover:ring-primary/20">
      {/* Top Row: Icon + Delete */}
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
          {/* Folder icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            title="Editar projeto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Excluir projeto"
          >
          {/* Trash icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            <path d="M10 11v6"></path>
            <path d="M14 11v6"></path>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
          </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-foreground font-bold text-base mb-1 break-words line-clamp-2">{project.nome}</h3>
      <p className="text-muted-foreground text-sm mb-4 break-words line-clamp-3">{project.descricao || 'Sem descrição'}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-muted-foreground text-xs mb-5">
        <span className="flex items-center gap-1.5">
          {/* Tree icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 22v-7"></path>
            <path d="M17 8h1a4 4 0 0 1 0 8h-2"></path>
            <path d="M6.3 15H5a4 4 0 0 1 0-8h1"></path>
            <path d="M8 8a4 4 0 1 1 8 0v8H8V8z"></path>
          </svg>
          {pointCount} árvore(s)
        </span>
        <span className="flex items-center gap-1.5">
          {/* Calendar icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {data}
        </span>
      </div>

      {/* Open Button */}
      <button
        onClick={onOpen}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold border-none cursor-pointer hover:brightness-110 transition-all text-sm"
      >
        Abrir
      </button>
    </div>
  );
}
