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
        <h2 className="text-foreground text-xl font-bold font-display">
          {projectToEdit ? 'Editar Projeto' : 'Novo Projeto'}
        </h2>
        {!projectToEdit && (
          <p className="text-muted-foreground text-sm mt-1 mb-4">Defina um nome para seu plano de arborização</p>
        )}
        {projectToEdit && <div className="mb-4" />}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-bold text-earth uppercase tracking-wider mb-1.5">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Nome do projeto (ex: Arborização da Rua das Flores)"
              required
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg bg-input-bg border-[1.5px] border-border-subtle text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
            />
            <span className="block text-right text-xs text-muted-foreground mt-1">{nome.length}/100</span>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-earth uppercase tracking-wider mb-1.5">Descrição <span className="normal-case font-normal text-muted-foreground">opcional</span></label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg bg-input-bg border-[1.5px] border-border-subtle text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring resize-none"
            />
            <span className="block text-right text-xs text-muted-foreground mt-1">{descricao.length}/500</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-border text-muted-foreground font-semibold cursor-pointer hover:bg-muted transition-colors bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-nature-dark text-white font-bold py-3 rounded-lg border-none cursor-pointer hover:bg-nature-dark/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : (projectToEdit ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
