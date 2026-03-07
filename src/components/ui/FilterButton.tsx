interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterButton({ label, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border-none ${
        active
          ? 'bg-verde-primario text-white shadow-leve'
          : 'bg-verde-claro text-verde-primario hover:bg-verde-primario/20'
      }`}
    >
      {label}
    </button>
  );
}
