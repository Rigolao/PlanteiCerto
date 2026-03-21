import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function FormSection({ title, children, defaultOpen = true }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors border-none cursor-pointer text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <ChevronDown
          size={18}
          className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children}
        </div>
      )}
    </div>
  );
}
