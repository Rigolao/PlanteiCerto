import type { Projeto } from '../../types/project';

interface ProjectCardProps {
  project: Projeto;
  pointCount: number;
  onOpen: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, pointCount, onOpen, onDelete }: ProjectCardProps) {
  const data = new Date(project.created_at).toLocaleDateString('pt-BR');

  return (
    <div className="bg-bg-card rounded-2xl shadow-leve p-5 transition-all hover:shadow-hover">
      <h3 className="text-verde-primario font-bold text-lg mb-2">{project.nome}</h3>
      <div className="text-texto-secundario text-sm flex flex-col gap-1 mb-4">
        <span>{project.descricao || 'Sem descrição'}</span>
        <span>{pointCount} árvore(s) plantada(s)</span>
        <span>Criado em: {data}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onOpen}
          className="flex-1 py-2 rounded-lg bg-verde-primario text-white font-bold border-none cursor-pointer hover:brightness-110 transition-all text-sm"
        >
          Abrir
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-2 rounded-lg bg-white text-red-500 font-bold border-2 border-red-200 cursor-pointer hover:bg-red-50 transition-all text-sm"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
