import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  buildCriteriaSummary,
  calculateScore,
  evaluateEliminatory,
  type Answers,
  type Tree,
} from './rules.ts';

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

    // Phase 1: Eliminatory — só espécies aprovadas. As que requerem avaliação técnica
    // (critério exigido sem dado) ainda não têm lista própria na resposta e ficam de fora.
    const survivors = trees.filter((t) => evaluateEliminatory(t, answers).status === 'aprovada');

    // Phase 2: Scoring with breakdown (ainda sem metadado de valores estimados)
    const scored = survivors.map((t) => {
      const { score, breakdown } = calculateScore(t, answers, new Set());
      return { ...t, score, scoreBreakdown: breakdown };
    });

    scored.sort((a, b) => b.score - a.score);

    console.log(JSON.stringify({
      event: 'recommendation_success',
      total_trees: totalCount,
      eliminated_count: totalCount - survivors.length,
      trees_returned: scored.length,
    }));

    return new Response(
      JSON.stringify({
        trees: scored,
        eliminated_count: totalCount - survivors.length,
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
