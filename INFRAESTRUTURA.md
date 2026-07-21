# Infraestrutura de produção (VPS self-hosted)

Este documento descreve a infraestrutura real que roda (ou vai rodar) o backend do
PlanteiCerto: um Supabase self-hosted numa VPS, migrado do Supabase Cloud gerenciado.
O frontend continua na Vercel em ambos os cenários.

**Status atual:** cutover feito — o app de produção real (`www.planteicerto.com.br`,
Vercel) já aponta pra VPS. Supabase Cloud continua ativo (não cancelado) como
rede de segurança durante o período de observação; rollback é só reverter a env
var da Vercel enquanto o Cloud não for cancelado.

## Arquitetura

- **VPS**: Hostinger KVM 2, São Paulo, Ubuntu 24.04 — IP `179.197.233.55`
- **Stack**: `docker/` oficial do repo `supabase/supabase`, em `/root/supabase/docker`
  na VPS, com overlays `docker-compose.s3.yml` (MinIO como backend de Storage) e
  `docker-compose.caddy.yml` (reverse proxy + TLS automático via Let's Encrypt)
- **Domínio da API**: `api.planteicerto.com.br` (DNS gerenciado no registro.br,
  registro A apontando pro IP da VPS)
- **Frontend**: continua na Vercel, domínio `planteicerto.com.br` — sem alterações
  de hospedagem, só a origem dos dados muda no cutover

## Acesso

| O quê | Como |
|---|---|
| SSH | `ssh root@srv1846411.hstgr.cloud` (ou pelo IP) — chave, sem senha |
| Studio (dashboard) | `https://api.planteicerto.com.br/project/default` — basic auth (`DASHBOARD_USERNAME`/`DASHBOARD_PASSWORD` no `.env` da VPS) |
| MCP (Claude Code) | Só via túnel SSH — ver seção MCP abaixo |
| Postgres direto | Só de dentro da VPS (porta 5432 em `127.0.0.1`), via `docker exec -it supabase-db psql -U postgres -d postgres` |

Toda a config real (segredos, chaves, senhas) vive em `/root/supabase/docker/.env`
na VPS — **nunca versionado**, nunca copiado pra este repositório.

## Runbook — operações comuns

Todos os comandos abaixo rodam **na VPS**, em `/root/supabase/docker`.

**Aplicar uma migration nova:**
```bash
docker cp minha_migration.sql supabase-db:/tmp/
docker exec -it supabase-db psql -U postgres -d postgres -f /tmp/minha_migration.sql
```

**Deploy de uma edge function (nova versão):**
```bash
# do Mac:
scp -r supabase/functions/nome-da-function root@srv1846411.hstgr.cloud:/root/supabase/docker/volumes/functions/
# na VPS:
docker compose -f docker-compose.yml -f docker-compose.s3.yml -f docker-compose.caddy.yml up -d --force-recreate --no-deps functions
```

**Recriar um serviço depois de mudar `.env` ou `docker-compose.yml`:**
```bash
docker compose -f docker-compose.yml -f docker-compose.s3.yml -f docker-compose.caddy.yml up -d --force-recreate --no-deps <servico>
```
(`restart` sozinho **não** relê `.env`/compose — precisa do `up -d`)

**Ver logs de um serviço:**
```bash
docker logs <nome-do-container> --tail 50 -f
# containers: supabase-db, supabase-auth, supabase-storage, supabase-edge-functions, supabase-kong, supabase-caddy
```

## Storage

Backend: **MinIO** (S3-compatible), containers `supabase-minio-1` +
`supabase-minio-createbucket-1`. 4 buckets públicos: `avatars`, `criterios`,
`guias`, `tree-images`.

> **Bug conhecido (sem fix)**: o endpoint S3 protocol nativo do self-hosted
> (`/storage/v1/s3`, usado por `rclone`/`aws-cli`) retorna `SignatureDoesNotMatch`
> mesmo com credenciais corretas — reproduzido via Kong e direto no container,
> com backend `file` e `s3`. Corresponde a issues abertas não resolvidas no
> `supabase/storage` (#572, #495, #569, #646). **Workaround**: usar a REST API
> normal do Storage (`POST /storage/v1/object/{bucket}/{path}` com header
> `x-upsert: true` e `Authorization: Bearer <SERVICE_ROLE_KEY>`) em vez do
> protocolo S3 para uploads em massa/scripts.

## Auth

- **Email/senha**: SMTP real via Brevo (300 emails/dia grátis). Domínio
  `planteicerto.com.br` autenticado (SPF/DKIM/DMARC), remetente
  `noreply@planteicerto.com.br`. Templates customizados (`supabase/email_templates/`)
  hospedados como bucket público `email-templates` no próprio Storage — self-hosted
  Docker exige URL pública pros templates (diferente do CLI local, que aceita
  `content_path` de arquivo).
- **Google OAuth**: funcionando, credencial do Google Cloud Console com redirect
  URI `https://api.planteicerto.com.br/auth/v1/callback`. **Atenção**: o template
  oficial do `docker-compose.yml` vem com `GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI`
  errado (`${API_EXTERNAL_URL}/callback`, falta o `/auth/v1`) — já corrigido na
  VPS, mas cuidado se recriar do zero.
- **`supabase db dump` (schema) exclui objetos anexados em tabelas dos schemas
  `auth`/`storage`** ("schemas internos"), mesmo quando a lógica é 100% da
  aplicação. O restore inicial (feito com dump bruto da cloud, não com as
  migrations do repo) ficou faltando dois pedaços — **ambos já cobertos pela
  migration reconciliada `supabase/migrations/20260702000001_auth_storage_from_prod.sql`**,
  que não foi usada no restore de hoje. Descobertos só **depois do cutover**,
  com usuário real:
  1. **Trigger `on_auth_user_created`** (cria a linha em `public.profiles` no
     signup — a função `handle_new_user()` restaurou normal, só o
     `CREATE TRIGGER ... ON auth.users` que faltou). Sintoma: login OAuth
     funciona, mas toda query em `profiles` dá `406 PGRST116` (zero linhas).
  2. **RLS de `storage.objects` sem nenhuma policy** — `rowsecurity = true` e
     zero policies bloqueia upload pra todo mundo (admin de árvore, avatar),
     service_role continua funcionando por bypassar RLS (por isso passou
     despercebido nos nossos testes, que usaram service_role/scripts, não a
     UI real). Mais grave que o trigger — vale testar upload de imagem logo
     depois de qualquer restore futuro.

  Fix aplicado (idempotente, pode rodar de novo sem problema — `ON CONFLICT`/
  policies teriam que ser dropadas antes de recriar se já existirem):
  ```sql
  -- rodar o conteúdo completo de 20260702000001_auth_storage_from_prod.sql
  ```
  Checklist pós-restore pra não repetir isso:
  ```sql
  select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
  select count(*) from pg_policies where schemaname='storage' and tablename='objects';
  ```
  (esperado: 1 trigger, 10 policies)
- **`SITE_URL`/`ADDITIONAL_REDIRECT_URLS`**: precisam apontar pro domínio real do
  frontend, senão o GoTrue cai no fallback (`localhost:3000`, valor padrão do
  template) depois do login — isso quebrou o Google OAuth logo após o cutover.
  Valores corretos hoje: `SITE_URL=https://www.planteicerto.com.br` (canônico —
  `planteicerto.com.br` sem `www` dá 307 pra `www`); `ADDITIONAL_REDIRECT_URLS`
  inclui `www`, raiz, `/reset-password` de ambos, e `http://localhost:5173`
  (+ `/reset-password`) pra dev local.

## MCP (self-hosted)

Endpoint bloqueado por padrão (sem OAuth, só rede). Habilitado via IP-restriction
no `kong.yml` (`volumes/api/kong.yml`, rota `/mcp`) liberando o gateway Docker da
VPS. Uso:

```bash
# túnel (deixa rodando em background)
ssh -f -N -L 8001:127.0.0.1:8000 root@srv1846411.hstgr.cloud

# registra no Claude Code (uma vez só)
claude mcp add planteicerto-vps-supabase -t http http://localhost:8001/mcp
```

Precisou também `ALTER ROLE supabase_read_only_user WITH PASSWORD '<POSTGRES_PASSWORD>'`
(a senha dessa role interna não vinha configurada em lugar nenhum do compose) —
só executável como `supabase_admin` (único superuser real no self-hosted, `postgres`
não é superuser aqui).

## Backup

- **O quê**: `pg_dump -Fc` do banco completo + tar do volume MinIO (Storage)
- **Onde roda**: script `/root/backup.sh` na VPS, chamado via SSH com chave
  dedicada (`~/.ssh/planteicerto_backup`, sem passphrase, restrita via
  `authorized_keys` — `command="/root/backup.sh"`, só executa esse script,
  nada mais)
- **Agendamento**: `launchd` no Mac (`~/Library/LaunchAgents/br.com.planteicerto.backup.plist`),
  diário às 3h
- **Onde ficam**: `~/Developer/PlanteiCerto-backups/` no Mac, 1 arquivo `.tar`
  por dia, retenção de 14 dias
- **Restore testado**: sim, num container Postgres descartável (167 árvores,
  10 usuários recuperados corretos). Restore real deve usar a imagem
  `supabase/postgres:17.6.1.136` (não o `postgres:17` genérico) para não faltar
  as extensões `pg_net`/`supabase_vault`.

## Hardening aplicado

- `ufw`: só 22/80/443 públicos (resto dos serviços já em `127.0.0.1`)
- SSH: `PermitRootLogin prohibit-password` + `PasswordAuthentication no` — só chave
- `fail2ban` ativo (jail `sshd`)
- Swap 2GB
- `unattended-upgrades` ativo

## Segredos gerados/rotacionados

Vários segredos passaram por sessões de chat durante a configuração inicial
(senha do Postgres Cloud, `S3_PROTOCOL_ACCESS_KEY_SECRET`, `DASHBOARD_PASSWORD`,
Google Client Secret). **Devem ser rotacionados** — nenhum foi rotacionado ainda
até a última atualização deste documento.

## Cutover

**Feito em 2026-07-21.** Checklist executado:

1. ~~Rodar VPS em paralelo alguns dias, smoke test diário~~ — validado no mesmo dia
2. ✅ Re-sync final do banco/storage — zero drift (contagens e `rclone check`
   batendo 100% com a cloud, nada mudou desde a migração inicial)
3. ✅ Deploy na Vercel com `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` novos
4. ⏳ Observar 48-72h — em andamento
5. ⏳ Dump final do Cloud guardado, cancelar assinatura Supabase Pro — pendente
   até o período de observação terminar

**Rollback**: reverter as env vars da Vercel pro Cloud + redeploy, enquanto a
assinatura do Supabase Cloud não for cancelada (passo 5).
