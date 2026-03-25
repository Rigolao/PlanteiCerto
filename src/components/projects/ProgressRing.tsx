interface ProgressRingProps {
  count: number;
  max: number;
  size?: number;
}

export function ProgressRing({ count, max, size = 44 }: ProgressRingProps) {
  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(count / max, 1) : 0;
  const offset = circumference * (1 - progress);
  const isEmpty = count === 0;

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${count} árvores plantadas`}
    >
      <svg
        viewBox="0 0 36 36"
        style={{ width: size, height: size, transform: 'rotate(-90deg)' }}
      >
        {isEmpty ? (
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            className="text-border"
          />
        ) : (
          <>
            <circle
              cx="18" cy="18" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-border"
            />
            <circle
              cx="18" cy="18" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-primary"
            />
          </>
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-extrabold ${isEmpty ? 'text-muted-foreground' : 'text-primary'}`}>
          {count}
        </span>
      </div>
    </div>
  );
}
