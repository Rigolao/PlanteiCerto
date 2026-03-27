import { memo } from 'react';
import { Ruler, Leaf, Heart, Target, Flower2, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Question } from '../../data/questionnaire';

interface QuestionCardProps {
  question: Question;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

const groupIcons: Record<string, LucideIcon> = {
  'Espaço e Interferências': Ruler,
  'Condições Ecológicas': Leaf,
  'Preferências': Heart,
  'Contexto e Objetivos': Target,
  'Preferências Botânicas': Flower2,
  'Outros Fatores': SlidersHorizontal,
};

export const QuestionCard = memo(function QuestionCard({ question, selectedValue, onSelect }: QuestionCardProps) {
  const GroupIcon = groupIcons[question.groupLabel] ?? Leaf;
  const selectedValues = selectedValue ? selectedValue.split(',').filter(Boolean) : [];

  return (
    <div className="space-y-5">
      {/* Group badge */}
      <div className="flex items-center gap-1.5">
        <GroupIcon size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
          {question.groupLabel}
        </span>
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
              className={`w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all cursor-pointer ${
                isSelected
                  ? 'border border-[#a8c5a9] bg-[#e8ede9] text-[#1c2e1e] font-medium'
                  : isMaxReached
                  ? 'border border-border bg-muted/50 text-muted-foreground opacity-40 cursor-not-allowed'
                  : 'border border-border bg-muted/50 text-foreground/80 hover:border-primary/30'
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
});
