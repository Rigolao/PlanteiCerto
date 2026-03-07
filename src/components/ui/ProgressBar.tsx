interface ProgressBarProps {
  value: number;
  max?: number;
}

export function ProgressBar({ value, max = 5 }: ProgressBarProps) {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-verde-barra rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
