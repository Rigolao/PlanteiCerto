interface RatingInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  label: string;
  max?: number;
}

export function RatingInput({ value, onChange, label, max = 5 }: RatingInputProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={`w-8 h-8 rounded-full text-xs font-bold border-none cursor-pointer transition-all ${
              value != null && n <= value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {n}
          </button>
        ))}
        {value != null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-1 text-xs text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
