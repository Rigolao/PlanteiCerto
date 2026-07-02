import { createClient } from 'jsr:@supabase/supabase-js@2';

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

// Rate limit simples por IP (por instância; zera em cold start). Suficiente
// para frear enumeração em massa sem depender de estado externo.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; windowStart: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  // Bloqueio no servidor, não só via CORS: gateways (Kong) podem sobrescrever
  // os headers CORS com "*", anulando a restrição no navegador.
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'Origem não autorizada.' }),
      { status: 403, headers },
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Muitas tentativas. Aguarde um minuto.' }),
      { status: 429, headers },
    );
  }

  try {
    const { email } = await req.json();

    if (typeof email !== 'string' || email.length > 320 || !EMAIL_RE.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: 'E-mail inválido.' }),
        { status: 400, headers },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data, error } = await supabaseAdmin.rpc('email_exists', {
      p_email: email,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar e-mail.' }),
        { status: 500, headers },
      );
    }

    return new Response(JSON.stringify({ exists: data === true }), { status: 200, headers });
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: 'Requisição inválida.' }),
      { status: 400, headers },
    );
  }
});
