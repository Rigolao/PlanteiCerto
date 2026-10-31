import type { ReactNode } from 'react';
import type { Arvore } from '../../../types/tree';
import { CLASSES_NIVEL, nivelDaNota, type Polaridade } from '../../../lib/escala';
import { ROTULO_SEM_DADO } from '../../../lib/provenance';

interface EscalaNotaProps {
  campo: keyof Arvore;
  rotulo: string;
  dica?: string;
  valor: number | null;
  polaridade: Polaridade;
  /** Selo de origem do campo, logo abaixo da linha. */
  selo: ReactNode;
}

/**
 * Nota de 1 a 5 com cinco quadrados na cor do nível (favorável, intermediário, desfavorável).
 * A cor nunca vem sozinha: o número fica sempre ao lado e os quadrados são decorativos.
 */
export function EscalaNota({ campo, rotulo, dica, valor, polaridade, selo }: EscalaNotaProps) {
  const corPreenchida = valor == null ? null : CLASSES_NIVEL[nivelDaNota(valor, polaridade)].barra;

  return (
    <div data-campo={campo} className="min-w-0 border-b border-border py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-foreground">{rotulo}</div>
          {dica && <div className="text-[11px] text-muted-foreground">{dica}</div>}
        </div>
        {valor == null ? (
          <span className="text-[13px] text-muted-foreground">{ROTULO_SEM_DADO}</span>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <div aria-hidden="true" className="flex gap-[3px]">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`size-3 rounded-[3px] ${i <= valor ? corPreenchida : 'bg-border'}`} />
              ))}
            </div>
            <span className="text-[13px] font-semibold tabular-nums text-foreground">{`${valor}/5`}</span>
          </div>
        )}
      </div>
      {selo}
    </div>
  );
}
