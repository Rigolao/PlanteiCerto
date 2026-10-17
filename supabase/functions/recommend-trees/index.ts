import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  buildCriteriaSummary,
  calculateScore,
  evaluateEliminatory,
  type Answers,
  type ScoreCriterion,
  type Tree,
} from './rules.ts';

type ScoredTree = Tree & { score: number; scoreBreakdown: ScoreCriterion[] };
type PendingTree = ScoredTree & { pendencias: string[] };

const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',').map((o) => o.trim()) ?? [
  'http://localhost:5173',
  'http://localhost:4173',
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

// Limite de linhas por resposta da API (max_rows do PostgREST); páginas maiores seriam truncadas em silêncio.
const PROVENANCE_PAGE_SIZE = 1000;

/**
 * Chaves "<tree_id>:<campo>" dos valores marcados como estimados (origem `estimated*`).
 * É só metadado de apresentação da pontuação: se a consulta falhar, devolve conjunto vazio e
 * a recomendação segue sem o selo de estimativa em vez de cair.
 */
async function loadEstimatedValues(
  supabase: ReturnType<typeof createClient>,
): Promise<Set<string>> {
  const estimados = new Set<string>();
  try {
    for (let from = 0; ; from += PROVENANCE_PAGE_SIZE) {
      const { data, error } = await supabase
        .from('tree_value_provenance')
        .select('tree_id,campo,origem')
        .like('origem', 'estimated%')
        .order('tree_id')
        .order('campo')
        .range(from, from + PROVENANCE_PAGE_SIZE - 1);

      if (error) throw new Error(error.message);

      for (const row of data ?? []) estimados.add(`${row.tree_id}:${row.campo}`);
      if ((data?.length ?? 0) < PROVENANCE_PAGE_SIZE) break;
    }
    return estimados;
  } catch (err) {
    console.error(JSON.stringify({
      event: 'recommendation_provenance_unavailable',
      details: err instanceof Error ? err.message : String(err),
    }));
    return new Set<string>();
  }
}

// ── Main Handler ──

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const { answers } = (await req.json()) as { answers: Answers };

    if (!answers || typeof answers !== 'object') {
      console.error(JSON.stringify({ event: 'recommendation_error', reason: 'invalid_input' }));
      return new Response(
        JSON.stringify({ error: 'Campo "answers" é obrigatório' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    console.log(JSON.stringify({ event: 'recommendation_request', answers_count: Object.keys(answers).length }));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: allTrees, error } = await supabase.from('trees').select('*').eq('ativa', true);

    if (error) {
      console.error(JSON.stringify({ event: 'recommendation_error', reason: 'db_query_failed', details: error.message }));
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar espécies', details: error.message }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    const trees = (allTrees ?? []) as Tree[];
    const totalCount = trees.length;

    const estimados = await loadEstimatedValues(supabase);

    // Phase 1: Eliminatory — três resultados por espécie. `eliminada` sai da resposta (só entra na
    // contagem); `requer_avaliacao` (critério exigido sem dado) vai para a lista própria, com as pendências.
    // Phase 2: Scoring with breakdown, nas duas listas que ficam.
    const approved: ScoredTree[] = [];
    const pendingReview: PendingTree[] = [];
    let eliminatedCount = 0;

    for (const tree of trees) {
      const { status, pendencias } = evaluateEliminatory(tree, answers);
      if (status === 'eliminada') {
        eliminatedCount++;
        continue;
      }

      const { score, breakdown } = calculateScore(tree, answers, estimados);
      const scored: ScoredTree = { ...tree, score, scoreBreakdown: breakdown };
      if (status === 'aprovada') approved.push(scored);
      else pendingReview.push({ ...scored, pendencias });
    }

    approved.sort((a, b) => b.score - a.score);
    pendingReview.sort((a, b) => b.score - a.score);

    console.log(JSON.stringify({
      event: 'recommendation_success',
      total_trees: totalCount,
      eliminated_count: eliminatedCount,
      pending_count: pendingReview.length,
      trees_returned: approved.length,
      estimated_values: estimados.size,
    }));

    return new Response(
      JSON.stringify({
        trees: approved,
        pending_review: pendingReview,
        eliminated_count: eliminatedCount,
        pending_count: pendingReview.length,
        criteriaSummary: buildCriteriaSummary(answers),
      }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error(JSON.stringify({ event: 'recommendation_error', reason: 'unhandled_exception', details: String(err) }));
    return new Response(
      JSON.stringify({ error: 'Erro interno', details: String(err) }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  }
});
