interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Ex: Ipê, Oiti...' }: SearchInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
    />
  );
}
