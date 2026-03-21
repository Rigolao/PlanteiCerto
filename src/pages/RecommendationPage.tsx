import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionCard } from '../components/recommendation/QuestionCard';
import { ResultScreen } from '../components/recommendation/ResultScreen';
import { questionnaire, flattenQuestions } from '../data/questionnaire';
import { useRecommendation } from '../hooks/useRecommendation';
import type { Answers, RecommendedTree, CriteriaSummary } from '../types/recommendation';

type Phase = 'questions' | 'loading' | 'results';

export function RecommendationPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('questions');
  const [result, setResult] = useState<{ trees: RecommendedTree[]; eliminated_count: number; criteriaSummary: CriteriaSummary } | null>(null);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);

  const recommendation = useRecommendation();

  const allSteps = useMemo(() => flattenQuestions(questionnaire), []);

  const visibleSteps = useMemo(() => {
    return allSteps.filter((q) => {
      if (!q.showIf) return true;
      return q.showIf.values.includes(answers[q.showIf.questionId] ?? '');
    });
  }, [allSteps, answers]);

  const currentQuestion = visibleSteps[currentIndex];
  const isLastStep = currentIndex === visibleSteps.length - 1;

  const handleSelect = useCallback((value: string) => {
    if (!currentQuestion) return;
    if (currentQuestion.multiSelect) {
      const current = (answers[currentQuestion.id] ?? '').split(',').filter(Boolean);
      const exists = current.includes(value);
      let next: string[];
      if (exists) {
        next = current.filter((v) => v !== value);
      } else if (current.length < 2) {
        next = [...current, value];
      } else {
        return; // max 2 selected
      }
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: next.join(',') }));
    } else {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    }
  }, [currentQuestion, answers]);

  const handleNext = useCallback(async () => {
    if (!currentQuestion) return;

    if (isLastStep) {
      setPhase('loading');
      try {
        const data = await recommendation.mutateAsync(answers);
        setTotalAnalyzed(data.trees.length + data.eliminated_count);
        setResult(data);
        setPhase('results');
      } catch {
        setPhase('questions');
      }
    } else {
      setCurrentIndex((i) => Math.min(i + 1, visibleSteps.length - 1));
    }
  }, [currentQuestion, isLastStep, answers, recommendation, visibleSteps.length]);

  const handleBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleRestart = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setPhase('questions');
  }, []);

  const handleGoBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const progress = visibleSteps.length > 0 ? ((currentIndex + 1) / visibleSteps.length) * 100 : 0;

  return (
    <>
      {/* Back button */}
      <button
        onClick={handleGoBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar ao catálogo
      </button>

      {phase === 'questions' && currentQuestion && (
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">
                Pergunta {currentIndex + 1} de {visibleSteps.length}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-10">
            <QuestionCard
              question={currentQuestion}
              selectedValue={answers[currentQuestion.id]}
              onSelect={handleSelect}
            />
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8 max-w-md mx-auto">
            {currentIndex > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 px-4 py-3.5 rounded-xl bg-muted text-foreground font-semibold text-sm cursor-pointer hover:bg-muted/80 transition-all"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="flex-1 px-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm cursor-pointer hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLastStep ? 'Ver Resultados' : 'Próximo'}
            </button>
          </div>
        </div>
      )}

      {phase === 'loading' && (
        <div className="flex flex-col items-center justify-center text-center py-32">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mb-5" />
          <p className="text-lg text-foreground font-semibold font-display">Analisando espécies...</p>
          <p className="text-sm text-muted-foreground mt-1">Aplicando critérios do local</p>
        </div>
      )}

      {phase === 'results' && result && (
        <ResultScreen
          trees={result.trees}
          eliminatedCount={result.eliminated_count}
          totalCount={totalAnalyzed}
          criteriaSummary={result.criteriaSummary}
          onRestart={handleRestart}
          onClose={handleGoBack}
        />
      )}
    </>
  );
}
