import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const recommendation = useRecommendation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleNext = useCallback(() => {
    if (!currentQuestion) return;

    if (isLastStep) {
      setShowConfirmPopup(true);
    } else {
      setCurrentIndex((i) => Math.min(i + 1, visibleSteps.length - 1));
    }
  }, [currentQuestion, isLastStep, visibleSteps.length]);

  const confirmSubmit = useCallback(async () => {
    setShowConfirmPopup(false);
    setPhase('loading');
    try {
      const data = await recommendation.mutateAsync(answers);
      setTotalAnalyzed(data.trees.length + data.eliminated_count);
      setResult(data);
      setPhase('results');
    } catch {
      setPhase('questions');
    }
  }, [answers, recommendation]);

  const handleBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleRestart = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setPhase('questions');
  }, []);

  const handleEdit = useCallback(() => {
    setPhase('questions');
  }, []);

  const handleGoBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (phase === 'questions' && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeButton = container.children[currentIndex] as HTMLElement;
      if (activeButton) {
        const containerHalfWidth = container.clientWidth / 2;
        const buttonCenter = activeButton.offsetLeft + (activeButton.offsetWidth / 2);
        container.scrollTo({
          left: buttonCenter - containerHalfWidth,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex, phase]);

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
          {/* Question Map / Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-foreground font-semibold">
                Pergunta {currentIndex + 1} de {visibleSteps.length}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            
            <div className="relative w-full">
              {/* Background line to connect the dots */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
              
              <div 
                ref={scrollContainerRef}
                className="relative z-10 flex gap-3 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {visibleSteps.map((step, idx) => {
                  const isActive = idx === currentIndex;
                  const isAnswered = answers[step.id] !== undefined && answers[step.id] !== '';
                  
                  // Allow navigating up to the first unanswered question
                  const firstUnanswered = visibleSteps.findIndex(s => !answers[s.id]);
                  const maxClickable = firstUnanswered === -1 ? visibleSteps.length - 1 : firstUnanswered;
                  const isClickable = idx <= maxClickable;

                  let styleClass = "bg-card text-muted-foreground border-muted-foreground/30";
                  
                  if (isActive) {
                    styleClass = "bg-primary text-primary-foreground border-primary shadow-md scale-110 z-10 ring-4 ring-primary/10";
                  } else if (isAnswered) {
                    styleClass = "bg-primary/90 text-primary-foreground border-primary hover:bg-primary z-10";
                  } else if (isClickable) {
                    styleClass = "bg-card text-foreground border-border hover:border-primary/50";
                  }

                  return (
                    <button
                      key={step.id}
                      onClick={() => isClickable && setCurrentIndex(idx)}
                      disabled={!isClickable}
                      className={`relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-all duration-300 ${styleClass} ${!isClickable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={step.text}
                      aria-label={`Ir para pergunta ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
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
          onEdit={handleEdit}
          onClose={handleGoBack}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-lg p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-foreground font-display mb-2">Finalizar questionário?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Você respondeu a todas as perguntas obrigatórias. Deseja ver as árvores recomendadas para o seu local agora?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition-all cursor-pointer"
              >
                Revisar respostas
              </button>
              <button
                onClick={confirmSubmit}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all cursor-pointer"
              >
                Ver Recomendações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
