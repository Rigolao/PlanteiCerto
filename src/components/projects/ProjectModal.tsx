import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import type { Projeto } from '../../types/project';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nome: string, descricao: string) => Promise<unknown>;
  projectToEdit?: Projeto | null;
}

export function ProjectModal({ isOpen, onClose, onSave, projectToEdit }: ProjectModalProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setNome(projectToEdit.nome);
        setDescricao(projectToEdit.descricao || '');
      } else {
        setNome('');
        setDescricao('');
      }
    }
  }, [isOpen, projectToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true);
    await onSave(nome, descricao);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <h2 className="text-primary text-xl font-bold mb-4 font-display">
          {projectToEdit ? 'Editar Projeto' : 'Novo Projeto'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Nome do projeto (ex: Arborização da Rua das Flores)"
              required
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
            />
            <span className="block text-right text-xs text-muted-foreground mt-1">{nome.length}/100</span>
          </div>
          <div>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring resize-none"
            />
            <span className="block text-right text-xs text-muted-foreground mt-1">{descricao.length}/500</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground font-bold py-3 rounded-lg border-none cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Salvando...' : (projectToEdit ? 'Salvar Alterações' : 'Criar Projeto')}
          </button>
        </form>
      </div>
    </Modal>
  );
}
