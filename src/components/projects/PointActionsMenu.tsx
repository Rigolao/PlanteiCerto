import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface PointActionsMenuProps {
  onEdit: () => void;
  onRemove: () => void;
}

export function PointActionsMenu({ onEdit, onRemove }: PointActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors bg-transparent border-none cursor-pointer"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-50 min-w-[140px]"
        >
          <button
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors bg-transparent border-none cursor-pointer text-left"
          >
            <Pencil size={14} className="text-muted-foreground" />
            Editar espécie
          </button>
          <button
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); onRemove(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors bg-transparent border-none cursor-pointer text-left"
          >
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      )}
    </div>
  );
}
