import { useState } from 'react';
import type { Projeto } from '../../types/project';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { EmptyState } from '../ui/EmptyState';

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground font-display">Meus Projetos</h1>
        <button
          onClick={handleOpenNewModal}
          className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-full border-none cursor-pointer hover:brightness-110 transition-all text-sm"
        >
          + Novo Projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState message='Você ainda não tem projetos. Clique em "+ Novo Projeto" para começar!' />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              pointCount={p.points?.[0]?.count ?? 0}
              onOpen={() => onOpenProject(p.id)}
              onEdit={() => handleOpenEditModal(p)}
              onDelete={() => setDeleteId(p.id)}
            />
          ))}
        </div>
      )}

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
