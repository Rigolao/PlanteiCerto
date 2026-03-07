import { useState } from 'react';
import type { Projeto } from '../../types/project';
import { ProjectCard } from './ProjectCard';
import { NewProjectModal } from './NewProjectModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';

interface ProjectListProps {
  projects: Projeto[];
  onOpenProject: (id: string) => void;
  onCreateProject: (nome: string, descricao: string) => Promise<unknown>;
  onDeleteProject: (id: string) => Promise<boolean>;
}

export function ProjectList({ projects, onOpenProject, onCreateProject, onDeleteProject }: ProjectListProps) {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-verde-primario text-2xl font-bold">Meus Projetos</h2>
        <button
          onClick={() => setNewModalOpen(true)}
          className="bg-verde-primario text-white font-bold px-5 py-2.5 rounded-xl border-none cursor-pointer hover:brightness-110 transition-all text-sm"
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
              onDelete={() => setDeleteId(p.id)}
            />
          ))}
        </div>
      )}

      <NewProjectModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onCreate={onCreateProject}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) onDeleteProject(deleteId); }}
        title="Excluir projeto"
        message="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
