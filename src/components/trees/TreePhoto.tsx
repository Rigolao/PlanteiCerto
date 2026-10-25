interface TreePhotoProps {
  foto: string | null;
  alt: string;
  /** Classes de layout do uso (tamanho, arredondamento); valem para a foto e para o desenho genérico. */
  className?: string;
  /** Miniaturas: a legenda sai do visual e vai para leitores de tela e `title`. */
  compact?: boolean;
  /** Carregamento preguiçoso da foto (listas e comparação). */
  lazy?: boolean;
}

const LEGENDA_SEM_FOTO = 'Imagem ilustrativa — espécie sem foto';

/**
 * Foto da espécie. Sem foto, mostra um desenho genérico de folha com a legenda que o
 * identifica como ilustração, para não passar por registro fotográfico da espécie.
 */
export function TreePhoto({ foto, alt, className = '', compact = false, lazy = false }: TreePhotoProps) {
  if (foto) {
    return (
      <img
        src={foto}
        alt={alt}
        loading={lazy ? 'lazy' : undefined}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      title={compact ? LEGENDA_SEM_FOTO : undefined}
      className={`flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-[#d4e6d5] to-[#a0c4a2] ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className={`h-auto opacity-40 ${compact ? 'w-1/2' : 'w-1/3 max-w-20'}`}
      >
        <path d="M24 44V20" stroke="#1a4d2c" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 20C24 20 18 16 14 10C18 8 24 12 24 20Z" fill="#226437"/>
        <path d="M24 20C24 20 30 16 34 10C30 8 24 12 24 20Z" fill="#2d7a40"/>
        <path d="M24 28C24 28 17 24 13 17C17 14 24 19 24 28Z" fill="#1a5c30"/>
        <path d="M24 28C24 28 31 24 35 17C31 14 24 19 24 28Z" fill="#226437"/>
        <ellipse cx="24" cy="43" rx="5" ry="2" fill="#1a4d2c" opacity="0.2"/>
      </svg>
      <span className={compact ? 'sr-only' : 'px-3 text-center text-xs font-medium italic text-[#1a4d2c]'}>
        {LEGENDA_SEM_FOTO}
      </span>
    </div>
  );
}
