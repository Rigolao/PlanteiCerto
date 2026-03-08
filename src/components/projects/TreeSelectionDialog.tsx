import { useState, useMemo, useEffect, useRef } from 'react';
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
  onClose,
}: TreeSelectionDialogProps) {
  const [busca, setBusca] = useState('');
  const [observacao, setObservacao] = useState('');
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const lastIsOpen = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTreeId(initialTreeId || null);
      setObservacao(initialObservacao || '');
      setBusca('');
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 280);
      return () => clearTimeout(t);
    }
    lastIsOpen.current = isOpen;
  }, [isOpen, initialTreeId, initialObservacao]);

  // Bloqueio de scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const filteredTrees = useMemo(() => {
    if (!busca.trim()) return trees;
    const term = busca.toLowerCase();
    return trees.filter(
      (t) =>
        t.taxonomia.nomeComum.toLowerCase().includes(term) ||
        t.taxonomia.nomeBotanico.toLowerCase().includes(term)
    );
  }, [trees, busca]);

  if (!visible) return null;

  const handleConfirm = () => {
    if (selectedTreeId) {
      onSelect(selectedTreeId, observacao);
      onClose();
    }
  };

  const selectedTree = trees.find(t => t.id === selectedTreeId);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        backgroundColor: animating ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
        backdropFilter: animating ? 'blur(4px)' : 'blur(0px)',
        transition: 'background-color 0.28s ease, backdrop-filter 0.28s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-card w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: '90vh',
          opacity: animating ? 1 : 0,
          transform: animating ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
          transition: 'opacity 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Selecionar Árvore</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Escolha a espécie para este ponto no mapa</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body — scroll aqui */}
        <div className="flex-1 overflow-y-auto">

          {/* Busca */}
          <div className="px-5 pt-4 pb-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome ou espécie..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border text-sm text-foreground bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Grid de Árvores */}
          <div className="px-5 pb-3">
            {filteredTrees.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 text-sm">
                Nenhuma árvore encontrada para "{busca}"
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredTrees.map((tree) => {
                  const isSelected = selectedTreeId === tree.id;
                  return (
                    <button
                      key={tree.id}
                      onClick={() => setSelectedTreeId(isSelected ? null : tree.id)}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all text-left group ${
                        isSelected
                          ? 'border-primary shadow-md ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <img
                        src={tree.imagem}
                        alt={tree.taxonomia.nomeComum}
                        className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent flex flex-col justify-end p-2">
                        <span className="text-white text-xs font-semibold leading-tight line-clamp-2">{tree.taxonomia.nomeComum}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Árvore selecionada — preview */}
          {selectedTree && (
            <div className="mx-5 mb-3 flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <img src={selectedTree.imagem} alt={selectedTree.taxonomia.nomeComum} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none mb-0.5">{selectedTree.taxonomia.nomeComum}</p>
                <p className="text-xs text-muted-foreground italic truncate">{selectedTree.taxonomia.nomeBotanico}</p>
              </div>
              <div className="ml-auto flex-shrink-0 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          )}

          {/* Observação */}
          <div className="px-5 pb-5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Observação <span className="normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              placeholder="Comentário sobre esta muda ou local..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex gap-2.5 flex-shrink-0 bg-card">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-background border border-border hover:bg-muted transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTreeId}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground border-none cursor-pointer hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>
  );
}
