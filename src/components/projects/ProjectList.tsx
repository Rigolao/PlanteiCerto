import { useState } from 'react';
import type { Projeto } from '../../types/project';
import { ProjectRow } from './ProjectRow';
import { ProjectModal } from './ProjectModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Plus } from 'lucide-react';

interface ProjectListProps {
  projects: Projeto[];
  onOpenProject: (id: string) => void;
  onCreateProject: (nome: string, descricao: string) => Promise<unknown>;
  onEditProject: (id: string, nome: string, descricao: string) => Promise<unknown>;
  onDeleteProject: (id: string) => Promise<boolean>;
}

export function ProjectList({ projects, onOpenProject, onCreateProject, onEditProject, onDeleteProject }: ProjectListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Projeto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const maxPointCount = Math.max(10, ...projects.map(p => p.points?.[0]?.count ?? 0));
  const totalTrees = projects.reduce((sum, p) => sum + (p.points?.[0]?.count ?? 0), 0);

  const handleOpenNewModal = () => {
    setProjectToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (project: Projeto) => {
    setProjectToEdit(project);
    setModalOpen(true);
  };

  const handleSaveProject = async (nome: string, descricao: string) => {
    if (projectToEdit) {
      await onEditProject(projectToEdit.id, nome, descricao);
    } else {
      await onCreateProject(nome, descricao);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground font-serif">Meus Projetos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {projects.length} projeto{projects.length !== 1 ? 's' : ''} · {totalTrees} árvore{totalTrees !== 1 ? 's' : ''} plantada{totalTrees !== 1 ? 's' : ''} no total
        </p>
      </div>

      {/* Project Rows */}
      <div className="flex flex-col gap-1.5">
        {projects.map(p => (
          <ProjectRow
            key={p.id}
            project={p}
            pointCount={p.points?.[0]?.count ?? 0}
            maxPointCount={maxPointCount}
            onOpen={() => onOpenProject(p.id)}
            onEdit={() => handleOpenEditModal(p)}
            onDelete={() => setDeleteId(p.id)}
          />
        ))}

        {/* New Project Button (dashed row) */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpenNewModal}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenNewModal(); } }}
          className="flex items-center gap-4 p-4 border-[1.5px] border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-card transition-all duration-150"
        >
          <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Plus size={18} className="text-muted-foreground" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground/70">Novo projeto</div>
            <div className="text-xs text-muted-foreground">Comece um novo plano de arborização</div>
          </div>
        </div>
      </div>

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) onDeleteProject(deleteId); }}
        title="Excluir projeto"
        description="Tem certeza que deseja excluir este projeto? Todos os pontos mapeados e árvores vinculadas serão perdidos permanentemente."
        confirmLabel="Sim, excluir projeto"
        variant="danger"
      />
    </div>
  );
}
