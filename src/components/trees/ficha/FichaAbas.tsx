import { useRef, type KeyboardEvent } from 'react';
import type { AbaFicha, AbaId } from './abas';

interface FichaAbasProps {
  abas: Pick<AbaFicha, 'id' | 'rotulo' | 'icone'>[];
  ativa: AbaId;
  onChange: (id: AbaId) => void;
  /** Prefixo dos ids: aba `${idBase}-aba-${id}`, painel `${idBase}-painel-${id}` (o painel fica com o pai). */
  idBase: string;
}

/**
 * Barra de abas da ficha no padrão WAI-ARIA: só a aba ativa entra no Tab; setas dão a volta,
 * Home e End vão às pontas. No celular o ícone fica sobre o nome para as cinco caberem numa linha.
 */
export function FichaAbas({ abas, ativa, onChange, idBase }: FichaAbasProps) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);

  function irPara(indice: number) {
    const destino = (indice + abas.length) % abas.length;
    onChange(abas[destino].id);
    botoes.current[destino]?.focus();
  }

  function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    if (evento.key === 'ArrowRight') irPara(indice + 1);
    else if (evento.key === 'ArrowLeft') irPara(indice - 1);
    else if (evento.key === 'Home') irPara(0);
    else if (evento.key === 'End') irPara(abas.length - 1);
    else return;
    evento.preventDefault();
  }

  return (
    <div
      role="tablist"
      aria-label="Grupos de atributos"
      className="flex gap-0.5 overflow-x-auto rounded-xl bg-muted p-[3px] sm:gap-1 sm:p-1"
    >
      {abas.map(({ id, rotulo, icone: Icone }, indice) => {
        const selecionada = id === ativa;
        return (
          <button
            key={id}
            ref={elemento => { botoes.current[indice] = elemento; }}
            type="button"
            role="tab"
            id={`${idBase}-aba-${id}`}
            aria-selected={selecionada}
            aria-controls={`${idBase}-painel-${id}`}
            tabIndex={selecionada ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={evento => aoTeclar(evento, indice)}
            className={`flex min-h-[52px] flex-[1_0_auto] cursor-pointer flex-col items-center justify-center gap-[3px] whitespace-nowrap rounded-[9px] border-none px-0 py-1.5 text-[11px] font-semibold leading-tight tracking-tight transition-colors sm:min-h-11 sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm sm:tracking-normal ${
              selecionada ? 'bg-aba-ativa text-primary shadow-sm' : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icone size={16} aria-hidden="true" />
            {rotulo}
          </button>
        );
      })}
    </div>
  );
}
