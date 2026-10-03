import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Info, ShieldAlert } from 'lucide-react';
import { TreeFormModal } from '../components/admin/TreeFormModal';
import { TreeQualityDetailsPanel } from '../components/admin/TreeQualityDetailsPanel';
import { SearchInput } from '../components/ui/SearchInput';
import {
  getTreeInformationalGaps,
  getTreeQualityIssues,
  summarizeTreeInformation,
  summarizeTreeQuality,
  TREE_INFORMATION_FIELDS,
  TREE_QUALITY_RULES,
  type TreeInformationGroup,
} from '../lib/treeQuality';
import { useAdminTreeQuality } from '../hooks/useAdminTreeQuality';
import type { Arvore } from '../types/tree';

type ScopeFilter = 'active' | 'all';
type ImpactFilter = 'all' | 'eligibility' | 'ranking' | 'information' | 'clear';
type QualityFieldFilter = { type: 'field'; field: keyof Arvore } | { type: 'group'; group: TreeInformationGroup } | null;
type QualityRow = {
  tree: Arvore;
  recommendationGaps: ReturnType<typeof getTreeQualityIssues>;
  informationGaps: ReturnType<typeof getTreeInformationalGaps>;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof AlertTriangle;
  tone: 'amber' | 'blue' | 'green' | 'indigo';
}) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium leading-snug text-muted-foreground sm:text-sm">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground sm:mt-2 sm:text-3xl">{value.toLocaleString('pt-BR')}</p>
        </div>
        <span className={`shrink-0 rounded-lg p-1.5 sm:p-2 ${tones[tone]}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{detail}</p>
    </div>
  );
}

function FieldShortcut({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${label}: ${count} ${count === 1 ? 'árvore com campo ausente' : 'árvores com campo ausente'}`}
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-left text-xs font-medium transition-colors ${
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-foreground hover:bg-muted'
      }`}
    >
      <span className="min-w-0 break-words">{label}</span>
      <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}

export function AdminTreeQualityPage() {
  const { trees, isLoading, isConfigured, error, retry } = useAdminTreeQuality();
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<ScopeFilter>('active');
  const [impact, setImpact] = useState<ImpactFilter>('all');
  const [fieldFilter, setFieldFilter] = useState<QualityFieldFilter>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [detailsRow, setDetailsRow] = useState<QualityRow | null>(null);
  const [editingTree, setEditingTree] = useState<Arvore | null>(null);

  const scopedTrees = useMemo(
    () => scope === 'active' ? trees.filter((tree) => tree.ativa !== false) : trees,
    [scope, trees],
  );
  const summary = useMemo(() => summarizeTreeQuality(scopedTrees), [scopedTrees]);
  const informationSummary = useMemo(() => summarizeTreeInformation(scopedTrees), [scopedTrees]);

  const recommendationFieldCounts = useMemo(() => {
    const counts = new Map<keyof Arvore, number>();
    for (const tree of scopedTrees) {
      for (const issue of getTreeQualityIssues(tree)) {
        counts.set(issue.field, (counts.get(issue.field) ?? 0) + 1);
      }
    }
    return TREE_QUALITY_RULES
      .map((rule) => ({ field: rule.field, label: rule.label, count: counts.get(rule.field) ?? 0 }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'));
  }, [scopedTrees]);

  const rows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return scopedTrees
      .map((tree) => ({
        tree,
        recommendationGaps: getTreeQualityIssues(tree),
        informationGaps: getTreeInformationalGaps(tree),
      }))
      .filter(({ tree, recommendationGaps, informationGaps }) => {
        const matchesSearch = !normalizedSearch
          || tree.nome_popular.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
          || tree.nome_cientifico.toLocaleLowerCase('pt-BR').includes(normalizedSearch);
        const matchesImpact = impact === 'all'
          || (impact === 'eligibility' && recommendationGaps.some((issue) => issue.impacts.includes('eligibility')))
          || (impact === 'ranking' && recommendationGaps.some((issue) => issue.impacts.includes('ranking')))
          || (impact === 'information' && informationGaps.length > 0)
          || (impact === 'clear' && recommendationGaps.length === 0);
        const matchesField = fieldFilter === null
          || (fieldFilter.type === 'field'
            ? recommendationGaps.some((gap) => gap.field === fieldFilter.field)
              || informationGaps.some((gap) => gap.field === fieldFilter.field)
            : informationGaps.some((gap) => gap.group === fieldFilter.group));

        return matchesSearch && matchesImpact && matchesField;
      });
  }, [fieldFilter, impact, scopedTrees, search]);

  const currentPage = Math.min(page, Math.max(0, Math.ceil(rows.length / pageSize) - 1));
  const pageCount = Math.ceil(rows.length / pageSize);
  const visibleRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const firstVisible = rows.length === 0 ? 0 : currentPage * pageSize + 1;
  const lastVisible = Math.min((currentPage + 1) * pageSize, rows.length);

  function resetPageAndSetImpact(nextImpact: ImpactFilter) {
    setImpact(nextImpact);
    setFieldFilter(null);
    setPage(0);
  }

  function filterByField(field: keyof Arvore) {
    setImpact('all');
    setPage(0);
    setFieldFilter((current) => current?.type === 'field' && current.field === field
      ? null
      : { type: 'field', field });
  }

  function filterByInformationGroup(group: TreeInformationGroup) {
    setImpact('all');
    setPage(0);
    setFieldFilter((current) => current?.type === 'group' && current.group === group
      ? null
      : { type: 'group', group });
  }

  function openEditor(tree: Arvore) {
    setDetailsRow(null);
    setEditingTree(tree);
  }

  if (!isConfigured || error) {
    const notConfigured = error === 'not-configured';
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" size={22} />
          <div>
            <h1 className="text-xl font-bold text-foreground">Qualidade do catálogo indisponível</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {notConfigured
                ? 'O Supabase não está configurado. Este painel não usa a lista estática como substituta dos dados oficiais.'
                : 'Não foi possível carregar as árvores do Supabase. Verifique a conexão e tente novamente.'}
            </p>
            {!notConfigured && (
              <button
                type="button"
                onClick={retry}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Tentar novamente
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground" role="status">
        Carregando dados oficiais do catálogo...
      </div>
    );
  }

  const selectedFieldLabel = fieldFilter?.type === 'field'
    ? [...TREE_QUALITY_RULES, ...TREE_INFORMATION_FIELDS].find((field) => field.field === fieldFilter.field)?.label
    : fieldFilter?.group;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl">
      <header className="mb-5 sm:mb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Qualidade do catálogo</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Acompanhe separadamente campos usados pelo recomendador e dados complementares que merecem atenção.
        </p>
      </header>

      <section aria-label="Resumo de qualidade" className="mb-5 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:mb-6 sm:gap-3 xl:grid-cols-4">
        <SummaryCard
          label="Lacunas em filtros"
          value={summary.treesWithEligibilityGaps}
          detail="Árvores com campos ausentes que podem afetar a elegibilidade, conforme as respostas."
          icon={ShieldAlert}
          tone="amber"
        />
        <SummaryCard
          label="Pontuação incerta"
          value={summary.treesWithRankingGaps}
          detail="Árvores com dados usados na classificação do resultado."
          icon={CircleHelp}
          tone="blue"
        />
        <SummaryCard
          label="Sem lacunas do recomendador"
          value={summary.treesWithoutMappedGaps}
          detail="Sem ausência nos atributos mapeados para filtros e pontuação."
          icon={CheckCircle2}
          tone="green"
        />
        <SummaryCard
          label="Dados complementares ausentes"
          value={informationSummary.treesWithGaps}
          detail="Árvores com dados informativos ausentes, incluindo projeções opcionais."
          icon={Info}
          tone="indigo"
        />
      </section>

      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        Escopo: {summary.totalTrees.toLocaleString('pt-BR')} {scope === 'active' ? 'árvores ativas' : 'árvores do catálogo'} · {summary.totalIssues.toLocaleString('pt-BR')} lacunas do recomendador · {informationSummary.totalGaps.toLocaleString('pt-BR')} {informationSummary.totalGaps === 1 ? 'ausência complementar' : 'ausências complementares'}.
      </p>

      {(recommendationFieldCounts.length > 0 || informationSummary.fields.length > 0) && (
        <section aria-labelledby="common-gaps-heading" className="mb-4 rounded-xl border border-border bg-card p-3 sm:mb-5 sm:p-5">
          <div className="mb-3">
            <h2 id="common-gaps-heading" className="font-semibold text-foreground">Campos ausentes mais frequentes</h2>
            <p className="mt-1 text-xs text-muted-foreground">Contagem no escopo atual. Selecione um campo para filtrar a tabela.</p>
          </div>
          <div className="space-y-4">
            {recommendationFieldCounts.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">Recomendador · filtros e pontuação</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendationFieldCounts.slice(0, 5).map((field) => (
                    <FieldShortcut
                      key={field.field}
                      label={field.label}
                      count={field.count}
                      selected={fieldFilter?.type === 'field' && fieldFilter.field === field.field}
                      onClick={() => filterByField(field.field)}
                    />
                  ))}
                </div>
              </div>
            )}
            {informationSummary.fields.some((field) => field.group !== 'Projeção de crescimento') && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-300">Dados complementares · atenção</h3>
                <div className="flex flex-wrap gap-2">
                  {informationSummary.fields
                    .filter((field) => field.group !== 'Projeção de crescimento')
                    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'))
                    .slice(0, 5)
                    .map((field) => (
                      <FieldShortcut
                        key={field.field}
                        label={field.label}
                        count={field.count}
                        selected={fieldFilter?.type === 'field' && fieldFilter.field === field.field}
                        onClick={() => filterByField(field.field)}
                      />
                    ))}
                </div>
              </div>
            )}
            {informationSummary.fields.some((field) => field.group === 'Projeção de crescimento') && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Projeções opcionais ausentes: {informationSummary.fields
                    .filter((field) => field.group === 'Projeção de crescimento')
                    .reduce((total, field) => total + field.count, 0).toLocaleString('pt-BR')} ocorrências.
                </p>
                <button
                  type="button"
                  aria-pressed={fieldFilter?.type === 'group' && fieldFilter.group === 'Projeção de crescimento'}
                  onClick={() => filterByInformationGroup('Projeção de crescimento')}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
                >
                  Ver árvores com projeções ausentes
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-3 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(0);
            }}
            placeholder="Buscar por nome popular ou científico..."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="quality-scope">Escopo do catálogo</label>
            <select
              id="quality-scope"
              aria-label="Escopo do catálogo"
              value={scope}
              onChange={(event) => {
                setScope(event.target.value as ScopeFilter);
                setPage(0);
              }}
              className="w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-auto"
            >
              <option value="active">Árvores ativas</option>
              <option value="all">Todas as árvores</option>
            </select>
            <label className="sr-only" htmlFor="quality-impact">Filtrar por tipo de dado ausente</label>
            <select
              id="quality-impact"
              aria-label="Filtrar por tipo de dado ausente"
              value={impact}
              onChange={(event) => resetPageAndSetImpact(event.target.value as ImpactFilter)}
              className="w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-auto"
            >
              <option value="all">Todos os dados</option>
              <option value="eligibility">Afetam filtros</option>
              <option value="ranking">Afetam pontuação</option>
              <option value="information">Com dados complementares ausentes</option>
              <option value="clear">Sem lacunas do recomendador</option>
            </select>
          </div>
        </div>

        {fieldFilter && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Filtro por campo:</span>
            <span className="min-w-0 break-words font-medium text-foreground">{selectedFieldLabel}</span>
            <button
              type="button"
              onClick={() => {
                setFieldFilter(null);
                setPage(0);
              }}
              className="ml-auto text-xs font-semibold text-primary hover:underline"
            >
              Limpar
            </button>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-semibold text-foreground">Nenhuma árvore encontrada</p>
            <p className="mt-1 text-sm text-muted-foreground">Tente mudar os filtros ou a busca.</p>
          </div>
        ) : (
          <>
          <section className="space-y-3 lg:hidden" aria-label="Lista de árvores filtradas">
            {visibleRows.map((row) => {
              const { tree, recommendationGaps, informationGaps } = row;
              const filterGapCount = recommendationGaps.filter((gap) => gap.impacts.includes('eligibility')).length;
              const rankingGapCount = recommendationGaps.filter((gap) => gap.impacts.includes('ranking')).length;

              return (
                <article
                  key={tree.id}
                  aria-label={`Árvore ${tree.nome_popular}`}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-muted-foreground">#{tree.id}</p>
                      <h2 className="mt-0.5 break-words font-semibold leading-snug text-foreground">{tree.nome_popular}</h2>
                      <p className="mt-0.5 break-words text-xs italic text-muted-foreground">{tree.nome_cientifico}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${
                      tree.ativa === false
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {tree.ativa === false ? 'Inativa' : 'Ativa'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {filterGapCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        {filterGapCount} {filterGapCount === 1 ? 'filtro' : 'filtros'}
                      </span>
                    )}
                    {rankingGapCount > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {rankingGapCount} de pontuação
                      </span>
                    )}
                    {informationGaps.length > 0 && (
                      <span className="rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-semibold text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {informationGaps.length} informativos
                      </span>
                    )}
                    {recommendationGaps.length === 0 && informationGaps.length === 0 && (
                      <span className="text-xs text-muted-foreground">Sem campos ausentes mapeados</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailsRow(row)}
                    aria-label={`Ver análise de ${tree.nome_popular}`}
                    className="mt-3 min-h-10 w-full rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    Ver análise
                  </button>
                </article>
              );
            })}
          </section>

          <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
            <table className="w-full min-w-[840px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Árvore</th>
                  <th className="px-4 py-3 font-semibold">Situação</th>
                  <th className="px-4 py-3 font-semibold">Campos ausentes</th>
                  <th className="px-4 py-3 text-right font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const { tree, recommendationGaps, informationGaps } = row;
                  return (
                    <tr key={tree.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="mr-2 font-mono text-xs text-muted-foreground">#{tree.id}</span>
                        <span className="font-medium text-foreground">{tree.nome_popular}</span>
                        <span className="mt-0.5 block pl-8 text-xs italic text-muted-foreground">{tree.nome_cientifico}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          tree.ativa === false
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {tree.ativa === false ? 'Inativa' : 'Ativa'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {recommendationGaps.length > 0 && (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              {recommendationGaps.length} recomendador
                            </span>
                          )}
                          {informationGaps.length > 0 && (
                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {informationGaps.length} informativos
                            </span>
                          )}
                          {recommendationGaps.length === 0 && informationGaps.length === 0 && (
                            <span className="text-xs text-muted-foreground">Sem campos ausentes mapeados</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setDetailsRow(row)}
                          aria-label={`Ver análise de ${tree.nome_popular}`}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          Ver análise
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {rows.length === 0
              ? 'Nenhuma árvore nesta página.'
              : `Exibindo ${firstVisible.toLocaleString('pt-BR')}–${lastVisible.toLocaleString('pt-BR')} de ${rows.length.toLocaleString('pt-BR')} árvores filtradas.`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="quality-page-size" className="text-xs text-muted-foreground">Por página</label>
            <select
              id="quality-page-size"
              aria-label="Árvores por página"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
            >
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <button
              type="button"
              aria-label="Página anterior"
              disabled={currentPage === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="rounded-lg border border-border p-1.5 text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span className="min-w-20 text-center text-xs text-muted-foreground" aria-label="Página atual">
              {pageCount === 0 ? '0 / 0' : `${currentPage + 1} / ${pageCount}`}
            </span>
            <button
              type="button"
              aria-label="Próxima página"
              disabled={pageCount === 0 || currentPage >= pageCount - 1}
              onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              className="rounded-lg border border-border p-1.5 text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          “Sem lacunas do recomendador” considera apenas campos usados em filtros e pontuação. Projeções de crescimento podem não se aplicar a todas as espécies; os dados complementares servem para orientar revisão, não indicar erro.
        </p>
      </section>

      {detailsRow && (
        <TreeQualityDetailsPanel
          tree={detailsRow.tree}
          recommendationGaps={detailsRow.recommendationGaps}
          informationGaps={detailsRow.informationGaps}
          onClose={() => setDetailsRow(null)}
          onEdit={openEditor}
        />
      )}

      <TreeFormModal
        isOpen={editingTree !== null}
        onClose={() => setEditingTree(null)}
        tree={editingTree}
      />
    </div>
  );
}
