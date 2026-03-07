import { useRef } from 'react';
import type { Arvore } from '../../types/tree';
import { Modal } from '../ui/Modal';
import { AttributeBar } from './AttributeBar';

interface TreeDetailModalProps {
  arvore: Arvore | null;
  isOpen: boolean;
  onClose: () => void;
}

const attrLabels = [
  { key: 'compatibilidade' as const, label: 'Boa para Calçadas e Ruas' },
  { key: 'limpeza' as const, label: 'Menos Sujeira na Rua' },
  { key: 'clima' as const, label: 'Benefício para o Clima' },
];

export function TreeDetailModal({ arvore, isOpen, onClose }: TreeDetailModalProps) {
  // Preserva a última arvore válida para que a animação de saída tenha conteúdo
  const lastArvore = useRef<Arvore | null>(null);
  if (arvore) lastArvore.current = arvore;

  const displayArvore = lastArvore.current;
  if (!displayArvore) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <img
        src={displayArvore.imagem}
        alt={displayArvore.nomePopular}
        className="w-full h-64 object-cover rounded-t-2xl"
      />
      <div className="p-6 md:p-8">
        <h2 className="text-primary text-2xl font-bold mb-0.5 font-display">{displayArvore.nomePopular}</h2>
        <p className="text-muted-foreground italic mb-5">{displayArvore.nomeCientifico}</p>
        <p className="text-foreground leading-relaxed mb-6 text-[15px]">{displayArvore.descricao}</p>

        {/* Info Cards */}
        <div className="bg-background rounded-xl p-5 mb-6 space-y-3 border border-border">
          <div className="flex items-center gap-3">
            {/* Altura — seta para cima */}
            <svg className="flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <polyline points="6 10 12 4 18 10"></polyline>
            </svg>
            <p className="text-sm text-foreground"><strong>Altura Máxima:</strong> {displayArvore.altura}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Raiz — círculo com ponto */}
            <svg className="flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <p className="text-sm text-foreground"><strong>Tipo de Raiz:</strong> {displayArvore.raiz}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Espaçamento — seta horizontal */}
            <svg className="flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <polyline points="10 6 4 12 10 18"></polyline>
              <polyline points="14 6 20 12 14 18"></polyline>
            </svg>
            <p className="text-sm text-foreground"><strong>Espaçamento Ideal:</strong> {displayArvore.espacamento}</p>
          </div>
        </div>

        <h3 className="text-foreground font-bold text-lg mb-4 font-display">O que esta árvore faz pela cidade</h3>
        {attrLabels.map(a => (
          <AttributeBar key={a.key} label={a.label} atributo={displayArvore.atributos[a.key]} showDetails />
        ))}
      </div>
    </Modal>
  );
}
