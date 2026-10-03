import { useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { flattenQuestions, questionnaire } from '../../data/questionnaire';
import type { TreeInformationGroup, TreeQualityRule } from '../../lib/treeQuality';
import type { Arvore } from '../../types/tree';

const questionLabels = new Map(
  flattenQuestions(questionnaire).map((question) => [question.id, question.text]),
);

function missingValueLabel(value: unknown): string {
  if (value === undefined) return 'Campo não retornado pela consulta';
  if (value === null) return 'NULL no banco';
  if (typeof value === 'string' && value.trim() === '') return 'Texto vazio';
  if (typeof value === 'string' && value.trim().toLowerCase() === 'null') return 'Texto literal "null"';
  return 'Valor ausente';
}

function groupedInformationFields(fields: ReturnType<typeof import('../../lib/treeQuality').getTreeInformationalGaps>) {
  const groups = new Map<TreeInformationGroup, typeof fields>();
  for (const field of fields) {
    groups.set(field.group, [...(groups.get(field.group) ?? []), field]);
  }
  return [...groups.entries()];
}

function ImpactBadge({ rule }: { rule: TreeQualityRule }) {
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
      {rule.impacts.includes('eligibility') && rule.impacts.includes('ranking')
        ? 'Filtro e pontuação'
        : rule.impacts.includes('eligibility') ? 'Filtro' : 'Pontuação'}
    </span>
  );
}

export function TreeQualityDetailsPanel({
  tree,
  recommendationGaps,
  informationGaps,
  onClose,
  onEdit,
}: {
  tree: Arvore;
  recommendationGaps: TreeQualityRule[];
  informationGaps: ReturnType<typeof import('../../lib/treeQuality').getTreeInformationalGaps>;
  onClose: () => void;
  onEdit: (tree: Arvore) => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const groupedFields = useMemo(() => groupedInformationFields(informationGaps), [informationGaps]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Tab' || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Fechar painel de análise"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/45"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tree-quality-panel-title"
        onKeyDown={handlePanelKeyDown}
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-border bg-background shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Análise da ficha · #{tree.id}</p>
            <h2 id="tree-quality-panel-title" className="mt-1 text-xl font-bold text-foreground">{tree.nome_popular}</h2>
            <p className="mt-0.5 text-sm italic text-muted-foreground">{tree.nome_cientifico}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar painel de análise"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-7">
          <section aria-labelledby="recommendation-gaps-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 id="recommendation-gaps-heading" className="font-semibold text-foreground">Campos do recomendador</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Podem afetar filtros de elegibilidade ou a pontuação, conforme as respostas.</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {recommendationGaps.length} {recommendationGaps.length === 1 ? 'lacuna' : 'lacunas'}
              </span>
            </div>
            {recommendationGaps.length === 0 ? (
              <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                Nenhum campo ausente nas regras mapeadas do recomendador.
              </p>
            ) : (
              <ul className="space-y-3">
                {recommendationGaps.map((rule) => (
                  <li key={rule.field} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{rule.label}</h4>
                        <code className="mt-1 block break-all text-xs text-muted-foreground">{rule.field}</code>
                      </div>
                      <ImpactBadge rule={rule} />
                    </div>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor encontrado</dt>
                        <dd className="mt-0.5 text-foreground">{missingValueLabel(tree[rule.field])}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Formato esperado</dt>
                        <dd className="mt-0.5 text-foreground">{rule.expectedFormat}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Critério relacionado</dt>
                        <dd className="mt-0.5 text-foreground">{rule.criteria}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Efeito atual da ausência</dt>
                        <dd className="mt-0.5 text-foreground">{rule.missingBehavior}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Perguntas relacionadas</dt>
                        <dd className="mt-1 space-y-1">
                          {rule.questionIds.map((questionId) => (
                            <p key={questionId} className="text-foreground">
                              <code className="mr-1.5 rounded bg-muted px-1 py-0.5 text-xs text-muted-foreground">{questionId}</code>
                              {questionLabels.get(questionId) ?? 'Pergunta não encontrada no questionário atual.'}
                            </p>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="information-gaps-heading">
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <h3 id="information-gaps-heading" className="font-semibold text-foreground">Dados complementares</h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Informativo</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Estes campos não alteram filtros nem pontuação do recomendador.</p>
            </div>
            {informationGaps.length === 0 ? (
              <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                Nenhum dado complementar mapeado está ausente.
              </p>
            ) : (
              <div className="space-y-4">
                {groupedFields.map(([group, fields]) => (
                  <section key={group} aria-label={group}>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">{group}</h4>
                    <ul className="space-y-2">
                      {fields.map((field) => (
                        <li key={field.field} className="rounded-lg border border-border bg-card px-3 py-2.5">
                          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                            <span className="font-medium text-foreground">{field.label}</span>
                            <span className="text-xs text-muted-foreground">{missingValueLabel(tree[field.field])}</span>
                          </div>
                          <code className="mt-1 block break-all text-xs text-muted-foreground">{field.field}</code>
                          <p className="mt-1 text-xs text-muted-foreground">Esperado: {field.expectedFormat}</p>
                          {field.note && <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">{field.note}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-border bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Fechar análise
          </button>
          <button
            type="button"
            onClick={() => onEdit(tree)}
            className="min-h-11 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Editar ficha
          </button>
        </footer>
      </aside>
    </div>
  );
}
