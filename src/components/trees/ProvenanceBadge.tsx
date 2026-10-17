import { useId, useState } from 'react';
import type { OrigemValor, ProvenanceRecord } from '../../types/provenance';
import { origemClasse, origemLabel, type OrigemClasse } from '../../lib/provenance';

interface ProvenanceBadgeProps {
  record?: ProvenanceRecord;
  /**
   * 'tabela' (padrão): sem registro não renderiza nada, para não poluir células e linhas.
   * 'detalhes': sem registro renderiza "Origem não registrada".
   */
  modo?: 'tabela' | 'detalhes';
  /** Classes de alinhamento do contêiner (ex.: `items-center`). Padrão: `items-start`. */
  className?: string;
}

const ROTULO_CURTO_OUTRO: Partial<Record<OrigemValor, string>> = {
  retido_da_fase_anterior: 'Fase anterior',
  consolidado_de_registro_inativo: 'Copiado de registro consolidado',
};

const ESTILO_POR_CLASSE: Record<OrigemClasse, string> = {
  publicado: 'bg-primary/10 text-primary',
  calculado: 'bg-primary/10 text-primary',
  estimado: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  outro: 'bg-muted text-muted-foreground',
  nao_avaliado: 'bg-muted text-muted-foreground',
};

/**
 * Rótulo curto do selo. Notas de rubrica mantêm o rótulo completo para ficarem
 * identificadas como estimativa. Registros "sem dado admissível" não ganham selo:
 * o valor da ficha já mostra "Não avaliado".
 */
function rotuloCurto(origem: OrigemValor): string | null {
  if (origem === 'estimated_rubric') return origemLabel(origem);
  const classe = origemClasse(origem);
  switch (classe) {
    case 'publicado':
      return 'Publicado';
    case 'calculado':
      return 'Calculado';
    case 'estimado':
      return 'Estimado';
    case 'outro':
      return ROTULO_CURTO_OUTRO[origem] ?? origemLabel(origem);
    case 'nao_avaliado':
      return null;
  }
}

export function ProvenanceBadge({ record, modo = 'tabela', className = 'items-start' }: ProvenanceBadgeProps) {
  const [aberto, setAberto] = useState(false);
  const painelId = useId();

  if (!record) {
    if (modo !== 'detalhes') return null;
    return <span className="text-[9px] text-muted-foreground">Origem não registrada</span>;
  }

  const rotulo = rotuloCurto(record.origem);
  const confiancaInline = record.origem === 'estimated_rubric' && record.confianca
    ? `confiança ${record.confianca}`
    : null;
  const detalhes: { rotulo: string; valor: string }[] = [
    { rotulo: 'Origem', valor: origemLabel(record.origem) },
    ...(record.fonte ? [{ rotulo: 'Fonte', valor: record.fonte }] : []),
    ...(record.metodo ? [{ rotulo: 'Método', valor: record.metodo }] : []),
    ...(record.confianca ? [{ rotulo: 'Confiança', valor: record.confianca }] : []),
    ...(record.observacao ? [{ rotulo: 'Observação', valor: record.observacao }] : []),
  ];

  return (
    <div className={`flex min-w-0 max-w-full flex-col gap-0.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        {rotulo && (
          <span className={`rounded-full px-1.5 py-px text-[9px] font-medium leading-tight ${ESTILO_POR_CLASSE[origemClasse(record.origem)]}`}>
            {rotulo}
          </span>
        )}
        {confiancaInline && (
          <span className="text-[9px] leading-tight text-muted-foreground">{confiancaInline}</span>
        )}
        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={aberto ? painelId : undefined}
          onClick={() => setAberto(valorAtual => !valorAtual)}
          className="cursor-pointer border-none bg-transparent p-0 text-[9px] leading-tight text-muted-foreground underline hover:text-foreground"
        >
          {aberto ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>
      </div>
      {record.valor_alterado_em && (
        <span className="text-[9px] leading-tight text-amber-800 dark:text-amber-300">
          Valor alterado após o registro da fonte
        </span>
      )}
      {aberto && (
        <dl
          id={painelId}
          className="w-full space-y-0.5 rounded-md bg-muted px-2 py-1 text-left text-[9px] leading-snug"
        >
          {detalhes.map(({ rotulo: nome, valor }) => (
            <div key={nome}>
              <dt className="font-semibold text-muted-foreground">{nome}</dt>
              <dd className="break-words text-foreground">{valor}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
