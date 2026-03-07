import { useState } from 'react';
import { Modal } from '../ui/Modal';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (nome: string, descricao: string) => Promise<unknown>;
}

export function NewProjectModal({ isOpen, onClose, onCreate }: NewProjectModalProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true);
    await onCreate(nome, descricao);
    setNome('');
    setDescricao('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <h2 className="text-verde-primario text-xl font-bold mb-4">Novo Projeto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome do projeto (ex: Arborização da Rua das Flores)"
            required
            className="px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-verde-primario focus:ring-1 focus:ring-verde-primario"
          />
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Descrição (opcional)"
            rows={3}
            className="px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-verde-primario focus:ring-1 focus:ring-verde-primario resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-verde-primario text-white font-bold py-3 rounded-lg border-none cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Projeto'}
          </button>
        </form>
      </div>
    </Modal>
  );
}
