import { useState, useMemo, useEffect, useRef } from 'react';
import { TreePine } from 'lucide-react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const lastIsOpen = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedTreeId(initialTreeId || null);
      setObservacao(initialObservacao || '');
      setBusca('');
      setDropdownOpen(false);
      setHighlightedIndex(-1);
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
        t.nome_popular.toLowerCase().includes(term) ||
        t.nome_cientifico.toLowerCase().includes(term)
    );
  }, [trees, busca]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const item = listboxRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!inputRef.current?.parentElement?.contains(target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  if (!visible) return null;

  const handleConfirm = () => {
    if (selectedTreeId) {
      onSelect(selectedTreeId, observacao);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setDropdownOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filteredTrees.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredTrees.length) {
          setSelectedTreeId(filteredTrees[highlightedIndex].id);
          setDropdownOpen(false);
          setBusca('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setDropdownOpen(false);
        break;
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
        className="bg-card w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
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

        {/* Body */}
        <div className="px-5 pt-4 pb-5 flex flex-col gap-4">
          {/* Combobox */}
          <div className="relative">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={dropdownOpen}
                aria-controls="tree-listbox"
                aria-activedescendant={highlightedIndex >= 0 ? `tree-option-${filteredTrees[highlightedIndex]?.id}` : undefined}
                placeholder="Buscar por nome ou espécie..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setDropdownOpen(true);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => setDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-input-bg border-[1.5px] border-border-subtle text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
              <ul
                ref={listboxRef}
                id="tree-listbox"
                role="listbox"
                className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-card border border-border rounded-lg shadow-lg"
              >
                {filteredTrees.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                    Nenhuma árvore encontrada
                  </li>
                ) : (
                  filteredTrees.map((tree, index) => (
                    <li
                      key={tree.id}
                      id={`tree-option-${tree.id}`}
                      role="option"
                      aria-selected={selectedTreeId === tree.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                        index === highlightedIndex
                          ? 'bg-primary/10'
                          : 'hover:bg-muted/50'
                      } ${selectedTreeId === tree.id ? 'bg-primary/5' : ''}`}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedTreeId(tree.id);
                        setDropdownOpen(false);
                        setBusca('');
                      }}
                    >
                      {tree.foto ? (
                        <img src={tree.foto} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          <TreePine size={16} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tree.nome_popular}</p>
                        <p className="text-xs text-muted-foreground italic truncate">{tree.nome_cientifico}</p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Selected tree preview */}
          {selectedTree && (
            <div className="flex items-center gap-3 p-3 border-l-[3px] border-l-primary bg-card border border-border rounded-xl">
              {selectedTree.foto ? (
                <img src={selectedTree.foto} alt={selectedTree.nome_popular} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
                  <TreePine size={18} className="text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-none mb-0.5 truncate">{selectedTree.nome_popular}</p>
                <p className="text-xs text-muted-foreground italic truncate">{selectedTree.nome_cientifico}</p>
              </div>
              <button
                onClick={() => setSelectedTreeId(null)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer flex-shrink-0"
                title="Remover seleção"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Observação */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Observação <span className="normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              placeholder="Comentário sobre esta muda ou local..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              maxLength={300}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition-all resize-none"
            />
            <span className="block text-right text-xs text-muted-foreground mt-1">{observacao.length}/300</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex gap-2.5 flex-shrink-0 bg-card">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-transparent border border-border hover:bg-muted transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTreeId}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-nature-dark text-white border-none cursor-pointer hover:bg-nature-dark/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>
  );
}
