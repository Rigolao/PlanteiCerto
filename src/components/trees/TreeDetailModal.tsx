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
  if (!arvore) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <img
        src={arvore.imagem}
        alt={arvore.nomePopular}
        className="w-full h-56 object-cover rounded-t-2xl"
      />
      <div className="p-6">
        <h2 className="text-verde-primario text-2xl font-bold mb-1">{arvore.nomePopular}</h2>
        <p className="text-texto-secundario italic mb-4">{arvore.nomeCientifico}</p>
        <p className="text-texto-principal leading-relaxed mb-6">{arvore.descricao}</p>

        <div className="bg-verde-claro/50 rounded-xl p-4 mb-6">
          <p className="mb-2"><strong>🌲 Tamanho / Altura Máxima:</strong> {arvore.altura}</p>
          <p className="mb-2"><strong>🪴 Tipo de Raiz:</strong> {arvore.raiz}</p>
          <p><strong>📏 Espaçamento Ideal:</strong> {arvore.espacamento}</p>
        </div>

        <h3 className="text-texto-principal font-bold text-lg mb-4">O que esta árvore faz pela cidade</h3>
        {attrLabels.map(a => (
          <AttributeBar key={a.key} label={a.label} atributo={arvore.atributos[a.key]} showDetails />
        ))}
      </div>
    </Modal>
  );
}
