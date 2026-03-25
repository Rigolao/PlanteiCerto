interface SkeletonProps {
  className?: string;
}

/** Bloco base animado com shimmer */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-muted rounded-lg ${className}`}
      style={{ isolation: 'isolate' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
          animation: 'skeleton-shimmer 1.5s infinite',
          transform: 'translateX(-100%)',
        }}
      />
    </div>
  );
}

/** Skeleton para o card de árvore */
export function TreeCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl ring-1 ring-border overflow-hidden">
      {/* Imagem */}
      <Skeleton className="w-full aspect-[4/3] rounded-none" />
      <div className="p-5 pb-4">
        {/* Nome popular */}
        <Skeleton className="h-5 w-2/3 mb-2" />
        {/* Nome científico */}
        <Skeleton className="h-3.5 w-1/2 mb-4" />
        {/* Label atributo */}
        <div className="flex items-center justify-between mb-1.5">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3.5 w-8" />
        </div>
        {/* Barra de progresso */}
        <Skeleton className="h-1.5 w-full" />
      </div>
    </div>
  );
}

/** Skeleton para a row de projeto */
export function ProjectRowSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 flex items-center gap-4">
      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}
