import type { Arvore } from '../../types/tree';

interface TreeCardProps {
  arvore: Arvore;
  onClick: () => void;
}

export function TreeCard({ arvore, onClick }: TreeCardProps) {
  return (
    <article
      onClick={onClick}
      className="bg-white rounded-2xl ring-1 ring-border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:ring-primary/20 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={arvore.imagem}
          alt={arvore.nomePopular}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-5 pb-4">
        <h2 className="text-primary text-lg font-bold mb-0.5 font-display">{arvore.nomePopular}</h2>
        <p className="text-muted-foreground text-sm italic mb-3">{arvore.nomeCientifico}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground">Boa para Calçadas e Ruas</span>
          <span className="text-muted-foreground font-semibold">{arvore.atributos.compatibilidade.nota}/5</span>
        </div>
        <div className="mt-1.5 h-1.5 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(arvore.atributos.compatibilidade.nota / 5) * 100}%` }}
          />
        </div>
      </div>
    </article>
  );
}
