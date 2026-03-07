import type { Ponto } from '../../types/project';
import type { Arvore } from '../../types/tree';

interface PointItemProps {
  ponto: Ponto;
  arvore: Arvore | undefined;
  onEdit: () => void;
  onRemove: () => void;
}

export function PointItem({ ponto, arvore, onEdit, onRemove }: PointItemProps) {
  return (
    <li className="flex items-center gap-3 bg-verde-claro/30 rounded-xl p-3">
      {arvore && (
        <img
          src={arvore.imagem}
          alt={arvore.nomePopular}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border-2 border-verde-primario"
        />
      )}
      <div className="flex-1 min-w-0">
        <span className="font-bold text-verde-primario text-sm block">{arvore?.nomePopular || 'Árvore desconhecida'}</span>
        {ponto.observacao && (
          <span className="text-texto-secundario text-xs block truncate">{ponto.observacao}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onEdit}
          className="text-blue-500 text-xs font-bold bg-transparent border-none cursor-pointer hover:text-blue-700"
        >
          Editar
        </button>
        <button
          onClick={onRemove}
          className="text-red-500 text-xs font-bold bg-transparent border-none cursor-pointer hover:text-red-700 relative pl-2 before:content-[''] before:absolute before:left-0 before:top-[20%] before:h-[60%] before:w-px before:bg-gray-300"
        >
          Remover
        </button>
      </div>
    </li>
  );
}
