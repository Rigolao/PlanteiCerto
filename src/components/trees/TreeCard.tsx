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
          alt={arvore.taxonomia.nomeComum}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-5 pb-4">
        <h2 className="text-primary text-lg font-bold mb-0.5 font-display">{arvore.taxonomia.nomeComum}</h2>
        <p className="text-muted-foreground text-sm italic mb-3">{arvore.taxonomia.nomeBotanico}</p>
        
        <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span className="text-primary">🌍</span> Nativa do Brasil
            </span>
            <span className="font-semibold text-foreground">
              {arvore.taxonomia.nativa ? 'Sim' : 'Não'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span className="text-primary">🏙️</span> Bom p/ Paisagismo
            </span>
            <span className="font-semibold text-foreground">
              {arvore.usoUrbanismo.recomendadoPaisagismo ? 'Sim' : 'Não'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
