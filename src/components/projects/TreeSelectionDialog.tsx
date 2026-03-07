import { useState, useMemo, useEffect } from 'react';
import type { Arvore } from '../../types/tree';

interface TreeSelectionDialogProps {
  isOpen: boolean;
  trees: Arvore[];
  initialTreeId?: number | null;
  initialObservacao?: string;
  onSelect: (treeId: number, observacao: string) => void;
  onClose: () => void;
}

export function TreeSelectionDialog({ 
  isOpen, 
  trees, 
  initialTreeId,
  initialObservacao,
  onSelect, 
  onClose 
}: TreeSelectionDialogProps) {
  const [busca, setBusca] = useState('');
  const [observacao, setObservacao] = useState('');
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);

  // Efeito para preencher e resetar o form apenas quando o Dialog abre/fecha
  useEffect(() => {
    if (isOpen) {
      setSelectedTreeId(initialTreeId || null);
      setObservacao(initialObservacao || '');
      setBusca('');
    }
  }, [isOpen, initialTreeId, initialObservacao]);

  const filteredTrees = useMemo(() => {
    if (!busca.trim()) return trees;
    const term = busca.toLowerCase();
    return trees.filter(
      (t) =>
        t.nomePopular.toLowerCase().includes(term) ||
        t.nomeCientifico.toLowerCase().includes(term)
    );
  }, [trees, busca]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedTreeId) {
      onSelect(selectedTreeId, observacao);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-verde-claro/50 flex items-center justify-between bg-verde-primario text-white">
          <h2 className="text-xl font-bold">Vincular Árvore ao Ponto</h2>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
          
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-verde-primario mb-1">Buscar Espécie</label>
            <input
              type="text"
              placeholder="Digite o nome popular ou científico..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-verde-claro focus:border-verde-primario focus:ring-2 focus:ring-verde-primario/20 outline-none transition-all"
            />
          </div>

          {/* Tree Grid */}
          <div className="flex-1 min-h-[200px] border-2 border-verde-claro border-dashed rounded-xl p-2 overflow-y-auto">
            {filteredTrees.length === 0 ? (
              <div className="text-center text-texto-secundario py-8">Nenhuma árvore encontrada</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredTrees.map((tree) => {
                  const isSelected = selectedTreeId === tree.id;
                  return (
                    <div
                      key={tree.id}
                      onClick={() => setSelectedTreeId(tree.id)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all group relative ${
                        isSelected 
                          ? 'border-verde-primario ring-2 ring-verde-primario/30 shadow-md' 
                          : 'border-transparent hover:border-verde-claro'
                      }`}
                    >
                      <img 
                        src={tree.imagem} 
                        alt={tree.nomePopular} 
                        className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                        <span className="text-white text-xs font-bold leading-tight">{tree.nomePopular}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-verde-primario rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Observation Note */}
          <div>
            <label className="block text-sm font-bold text-verde-primario mb-1">Observação (Opcional)</label>
            <textarea
              placeholder="Deseja adicionar algum comentário sobre esta muda ou local?"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-xl border-2 border-verde-claro focus:border-verde-primario focus:ring-2 focus:ring-verde-primario/20 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-verde-claro/50 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-xl text-texto-secundario font-bold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTreeId}
            className="px-6 py-2 rounded-xl bg-verde-primario text-white font-bold hover:bg-verde-escuro transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            Vincular e Salvar
          </button>
        </div>

      </div>
    </div>
  );
}
