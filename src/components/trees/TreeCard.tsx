import type { Arvore } from '../../types/tree';
import { AttributeBar } from './AttributeBar';

interface TreeCardProps {
  arvore: Arvore;
  onClick: () => void;
}

const attrLabels = [
  { key: 'compatibilidade' as const, label: 'Boa para Calçadas e Ruas' },
  { key: 'limpeza' as const, label: 'Menos Sujeira na Rua' },
  { key: 'clima' as const, label: 'Benefício para o Clima' },
];

export function TreeCard({ arvore, onClick }: TreeCardProps) {
  return (
    <article
      onClick={onClick}
      className="bg-bg-card rounded-2xl shadow-leve overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-hover hover:-translate-y-1"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={arvore.imagem}
          alt={arvore.nomePopular}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <h2 className="text-verde-primario text-xl font-bold mb-1">{arvore.nomePopular}</h2>
        <p className="text-texto-secundario text-sm italic mb-4">{arvore.nomeCientifico}</p>
        {attrLabels.map(a => (
          <AttributeBar key={a.key} label={a.label} atributo={arvore.atributos[a.key]} />
        ))}
      </div>
    </article>
  );
}
