const NIVEIS = [
  { rotulo: 'Favorável', classe: 'bg-nivel-alto' },
  { rotulo: 'Intermediário', classe: 'bg-nivel-medio' },
  { rotulo: 'Desfavorável', classe: 'bg-nivel-baixo' },
] as const;

/** Legenda das cores das notas de 1 a 5, uma vez por aba que tem escalas. */
export function LegendaNiveis() {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-[10px] bg-muted px-2.5 py-2 text-xs leading-snug text-muted-foreground">
      {NIVEIS.map(({ rotulo, classe }) => (
        <span key={rotulo} className="inline-flex items-center gap-1.5 text-foreground">
          <span aria-hidden="true" className={`size-3 rounded-[3px] ${classe}`} />
          {rotulo}
        </span>
      ))}
      <span>A cor já considera se, na escala, maior é melhor ou pior.</span>
    </div>
  );
}
