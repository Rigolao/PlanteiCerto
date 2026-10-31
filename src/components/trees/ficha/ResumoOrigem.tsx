import { useId } from 'react';
import type { CategoriaOrigem } from '../../../lib/resumoOrigem';

const CATEGORIAS: { categoria: CategoriaOrigem; rotulo: string; estilo: string }[] = [
  { categoria: 'publicado', rotulo: 'Publicado', estilo: 'bg-primary/10 text-primary' },
  { categoria: 'calculado', rotulo: 'Calculado', estilo: 'bg-primary/10 text-primary' },
  { categoria: 'estimado', rotulo: 'Estimado', estilo: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  { categoria: 'fase_anterior', rotulo: 'Fase anterior', estilo: 'bg-muted text-muted-foreground' },
  { categoria: 'consolidado', rotulo: 'Copiado de registro consolidado', estilo: 'bg-muted text-muted-foreground' },
  { categoria: 'sem_registro', rotulo: 'Origem não registrada', estilo: 'bg-muted text-muted-foreground' },
  { categoria: 'nao_avaliado', rotulo: 'Não avaliado', estilo: 'bg-muted text-muted-foreground' },
];

/**
 * Quantos valores da ficha vêm de cada origem. Número e rótulo ficam num só texto ("6 Publicado")
 * para não se confundir com os selos dos campos, que usam só o rótulo.
 */
export function ResumoOrigem({ contagem }: { contagem: Partial<Record<CategoriaOrigem, number>> | null }) {
  const tituloId = useId();
  const presentes = CATEGORIAS.filter(({ categoria }) => (contagem?.[categoria] ?? 0) > 0);
  if (!contagem || presentes.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[10px] border border-border px-3 py-2.5 text-xs">
      <span id={tituloId} className="font-semibold text-foreground">Origem dos dados nesta ficha</span>
      <ul aria-labelledby={tituloId} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {presentes.map(({ categoria, rotulo, estilo }) => (
          <li key={categoria} className={`rounded-full px-2 py-px text-[11px] font-semibold ${estilo}`}>
            {`${contagem[categoria]} ${rotulo}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
