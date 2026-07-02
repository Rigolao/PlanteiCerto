# Desenvolvimento local com Supabase self-hosted

Este projeto roda 100% na sua máquina: frontend Vite + stack Supabase completa em Docker
(Postgres, Auth, Storage, Edge Functions, Studio e Mailpit para emails). Não depende do
Supabase na nuvem — nem para auth, nem para emails, nem para as functions.

## Pré-requisitos

- **Docker Desktop** aberto (ícone da baleia ativo)
- **Node 20+** e `npm install` executado (o CLI do Supabase vem como devDependency)

## Subir e derrubar a stack

```bash
npx supabase start    # sobe ~10 containers (1ª vez baixa as imagens, demora)
npx supabase status   # URLs e chaves da stack
npx supabase stop     # para tudo (dados ficam salvos em volume Docker)
```

O `start` imprime as URLs e chaves. Serviços:

| Serviço | URL |
|---|---|
| API (REST/Auth/Storage/Functions) | http://127.0.0.1:54321 |
| **Studio** (painel visual, igual ao dashboard web) | http://127.0.0.1:54323 |
| **Mailpit** (todos os emails de auth caem aqui) | http://127.0.0.1:54324 |
| Postgres direto | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

## Configurar o frontend

Crie `.env.development.local` (gitignorado) com os valores que o `supabase start` imprimiu:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<ANON_KEY impresso pelo supabase start>
VITE_GATE_PASSWORD=<mesma do .env.development>
```

> ⚠️ Precisa ser `.env.development.local` — o Vite dá prioridade a `.env.development`
> sobre `.env.local`, então `.env.local` sozinho NÃO sobrescreve a URL do Supabase.

Depois:

```bash
npm run dev           # http://localhost:5173
```

## Edge Functions

```bash
npx supabase functions serve   # serve TODAS as functions com hot-reload
```

Ficam em `supabase/functions/`. O frontend chama normalmente via
`supabase.functions.invoke(...)` — a URL local já aponta para elas.

Testar na mão:

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/recommend-trees \
  -H "Authorization: Bearer $ANON_KEY" -H 'Content-Type: application/json' \
  -d '{"answers":{}}'
```

## Login com Google (local)

1. `.env.local` precisa ter `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
2. A credencial OAuth no Google Cloud Console precisa do redirect
   `http://127.0.0.1:54321/auth/v1/callback`
3. Exporte as variáveis antes de subir a stack:

```bash
export $(grep -E '^GOOGLE_' .env.local | xargs) && npx supabase start
```

## Emails (confirmação, reset de senha)

Nenhum email real é enviado. Tudo cai no **Mailpit** (http://127.0.0.1:54324),
sem limite de envio, já com os templates custom de `supabase/email_templates/`
(configurados no `config.toml`). Fluxo de teste: cadastre-se no app → abra o
Mailpit → clique no link de confirmação.

## Banco de dados: migrations e seed

- **Migrations**: `supabase/migrations/*.sql`, aplicadas em ordem de nome.
  A baseline `20260702000000_baseline_from_prod.sql` reproduz o schema de produção
  (tabelas, RLS, triggers); `..0001` cobre auth/storage; `..0002` a RPC `email_exists`.
- **Seed**: `supabase/seed.sql` insere as 167 árvores reais (roda após as migrations).
- **Arquivo morto**: `supabase/_archive/` guarda as migrations antigas e o schema/seed
  pré-migração de março — só histórico, não roda.

Comandos:

```bash
npx supabase db reset            # DESTRÓI o banco local e recria: migrations + seed
npx supabase migration new nome  # cria supabase/migrations/<timestamp>_nome.sql
```

Fluxo para mudar o schema: `migration new` → escrever SQL → `db reset` → testar.
Nunca edite migration já aplicada em produção; crie uma nova.

## Studio (painel admin)

http://127.0.0.1:54323 — mesma interface do dashboard web: Table Editor, SQL Editor,
usuários do Auth, Storage. Sem login (é local).

Para virar admin no app: SQL Editor →

```sql
update public.profiles set role = 'admin' where email = 'seu@email.com';
```

## Problemas comuns

| Sintoma | Causa/solução |
|---|---|
| `failed to connect to docker` | Docker Desktop fechado — abra e espere a baleia |
| App mostra só 22 árvores | Frontend caiu no fallback estático: `.env.development.local` ausente/errado, ou stack parada |
| Email não chega | Olhe o Mailpit (54324) — nunca vai para caixa real no local |
| Login Google `redirect_uri_mismatch` | Falta o redirect 54321 na credencial do Google Console |
| Porta ocupada | `npx supabase stop` + verifique 54321-54329 livres |

## Relação com produção (VPS)

O ensaio do deploy de produção (docker-compose oficial, idêntico ao que roda num VPS)
está documentado fora do repo em `~/Developer/PlanteiCerto-infra/ENSAIO-COMPOSE.md`,
junto com o plano de migração. Resumo do fluxo: desenvolver aqui → commitar migrations
e functions → aplicar no VPS (`psql` + copiar functions) → deploy do frontend na Vercel.
