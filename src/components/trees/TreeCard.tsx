import type { Arvore } from '../../types/tree';

interface TreeCardProps {
  arvore: Arvore;
  onClick: () => void;
}

export function TreeCard({ arvore, onClick }: TreeCardProps) {
  return (
    <article
      onClick={onClick}
      className="bg-card rounded-2xl ring-1 ring-border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:ring-primary/20 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        {arvore.foto ? (
          <img
            src={arvore.foto}
            alt={arvore.nome_popular}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">🌳</span>
            <span className="text-xs text-muted-foreground font-medium">Sem imagem</span>
          </div>
        )}
      </div>
      <div className="p-5 pb-4">
        <h2 className="text-primary text-lg font-bold mb-0.5 font-display">{arvore.nome_popular}</h2>
        <p className="text-muted-foreground text-sm italic mb-4 truncate">{arvore.nome_cientifico}</p>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-primary">📏</span> Altura
            </span>
            <span className="font-semibold text-foreground">
              {arvore.altura_adulta_max_m ? `${arvore.altura_adulta_max_m}m` : '—'} ({arvore.porte_altura_classe ?? 'N/A'})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-primary">🌍</span> Origem
            </span>
            <span className="font-semibold text-foreground">
              {arvore.origem === 'Nativa BR' ? '🇧🇷 Nativa' : '🌏 Exótica'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-primary">🌿</span> Folhagem
            </span>
            <span className="font-semibold text-foreground text-xs">
              {arvore.decidua_perenifolia ?? '—'}
            </span>
          </div>

          {arvore.presenca_espinhos !== null && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-primary">{arvore.presenca_espinhos ? '🔪' : '✨'}</span> Espinhos
              </span>
              <span className="font-semibold text-foreground">
                {arvore.presenca_espinhos ? 'Sim' : 'Não'}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
