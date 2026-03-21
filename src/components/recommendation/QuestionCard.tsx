import type { Question } from '../../data/questionnaire';

interface QuestionCardProps {
  question: Question;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

const groupColors: Record<number, { badge: string; border: string }> = {
  1: { badge: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
  2: { badge: 'bg-green-100 text-green-800', border: 'border-green-200' },
  3: { badge: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
  4: { badge: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
  5: { badge: 'bg-teal-100 text-teal-800', border: 'border-teal-200' },
  6: { badge: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
};

export function QuestionCard({ question, selectedValue, onSelect }: QuestionCardProps) {
  const colors = groupColors[question.group] ?? groupColors[1];
  const selectedValues = selectedValue ? selectedValue.split(',').filter(Boolean) : [];

  return (
    <div className="space-y-5">
      {/* Group badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
          {question.type === 'eliminatorio' ? 'Eliminatório' : 'Classificatório'}
        </span>
        <span className="text-xs text-muted-foreground">{question.groupLabel}</span>
      </div>

      {/* Question text */}
      <h3 className="text-lg font-bold text-foreground font-display leading-snug">
        {question.text}
      </h3>

      {/* Help text */}
      {question.helpText && (
        <p className="text-sm text-muted-foreground -mt-2">{question.helpText}</p>
      )}

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt) => {
          const isSelected = selectedValues.includes(opt.value);
          const isMaxReached = question.multiSelect && selectedValues.length >= 2 && !isSelected;

          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              disabled={isMaxReached}
              className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary/20'
                  : isMaxReached
                  ? 'bg-card border-border text-muted-foreground opacity-40 cursor-not-allowed'
                  : 'bg-card border-border text-foreground hover:border-primary/30'
              }`}
            >
              <span className="flex items-center gap-3">
                {question.multiSelect && (
                  <span
                    className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary border-primary' : 'border-border'
                    }`}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                )}
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
