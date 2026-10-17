#!/usr/bin/env bash
# Testa a carga da proveniência (supabase/snippets/provenance-import-20261017) no banco
# local do Supabase CLI SEM alterá-lo: tudo roda dentro de BEGIN … ROLLBACK.
#
# Uso: bash scripts/testar_carga_proveniencia_local.sh <CSV do SELECT * FROM trees>
#
# Prelúdio (dentro da transação): migration da tabela de proveniência; as 12 colunas
# numeric de 20/30 anos (o banco local ainda não as tem); TRUNCATE public.trees CASCADE
# e \copy do CSV de produção; migration que inativa 41/113/152 (deixa 152 ativas).
#
#   Execução A: prelúdio → 01 (sem BEGIN/COMMIT) → 02 → ROLLBACK.
#               Exige exit 0 e o aviso "Pós-carga da proveniência: OK".
#   Execução B: prelúdio → 01 → 01 de novo → ROLLBACK.
#               Exige exit ≠ 0 e a mensagem da trava de reexecução.
#
# Sai 0 só se A passar, B falhar pela trava de reexecução e o banco local terminar
# igual ao início (contagens de trees/points/user_favorites e ausência da tabela).

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Uso: bash scripts/testar_carga_proveniencia_local.sh <CSV do SELECT * FROM trees>" >&2
  exit 2
fi

CSV="$1"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTAINER="supabase_db_PlanteiCerto"
CSV_CONTAINER="/tmp/trees_export.csv"
SNIPPETS="$RAIZ/supabase/snippets/provenance-import-20261017"
SQL_01="$SNIPPETS/01-importar-proveniencia.sql"
SQL_02="$SNIPPETS/02-posflight.sql"
MIGRATION_PROVENIENCIA="$RAIZ/supabase/migrations/20261017000100_create_tree_value_provenance.sql"
MIGRATION_INATIVAR="$RAIZ/supabase/migrations/20261017000000_inativar_casos_especiais_trees.sql"
MSG_OK="Pós-carga da proveniência: OK"
MSG_REEXECUCAO="Carga de proveniência já aplicada: public.tree_value_provenance já contém 1480 linha(s)"

for arquivo in "$CSV" "$SQL_01" "$SQL_02" "$MIGRATION_PROVENIENCIA" "$MIGRATION_INATIVAR"; do
  if [[ ! -f "$arquivo" ]]; then
    echo "ERRO: arquivo não encontrado: $arquivo" >&2
    exit 1
  fi
done

if ! docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null | grep -qx true; then
  echo "ERRO: container $CONTAINER não está rodando (stack local do Supabase CLI)." >&2
  exit 1
fi

# O 01 precisa ter exatamente um BEGIN; e um COMMIT; em linhas próprias: são as
# linhas removidas para que ele rode dentro da transação do teste.
if [[ "$(grep -c '^BEGIN;$' "$SQL_01")" != 1 || "$(grep -c '^COMMIT;$' "$SQL_01")" != 1 ]]; then
  echo "ERRO: $SQL_01 deve ter exatamente uma linha 'BEGIN;' e uma 'COMMIT;'." >&2
  exit 1
fi
if grep -qiE '^[[:space:]]*(BEGIN|COMMIT|ROLLBACK|END)[[:space:]]*;' "$SQL_02"; then
  echo "ERRO: $SQL_02 não deve ter controle de transação." >&2
  exit 1
fi

# Colunas do \copy = cabeçalho do CSV (só nomes simples, separados por vírgula).
CABECALHO="$(head -n 1 "$CSV" | tr -d '\r')"
CABECALHO="${CABECALHO#$'\xEF\xBB\xBF'}"
if [[ ! "$CABECALHO" =~ ^[a-z0-9_]+(,[a-z0-9_]+)*$ ]]; then
  echo "ERRO: cabeçalho do CSV inesperado: $CABECALHO" >&2
  exit 1
fi
COLUNAS="${CABECALHO//,/, }"

TMP="$(mktemp -d)"
limpar() {
  docker exec "$CONTAINER" rm -f "$CSV_CONTAINER" >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap limpar EXIT

psql_local() {
  docker exec -i "$CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 "$@"
}

estado_banco() {
  psql_local -At -F ' ' <<'SQL'
SELECT 'arvores=' || (SELECT count(*) FROM public.trees),
       'ativas=' || (SELECT count(*) FROM public.trees WHERE ativa),
       'points=' || (SELECT count(*) FROM public.points),
       'favoritos=' || (SELECT count(*) FROM public.user_favorites),
       'tree_value_provenance=' || CASE WHEN to_regclass('public.tree_value_provenance') IS NULL
                                        THEN 'ausente' ELSE 'presente' END;
SQL
}

sem_transacao() {
  sed -e '/^BEGIN;$/d' -e '/^COMMIT;$/d' "$1"
}

ANTES="$(estado_banco)"
echo "Banco local antes: $ANTES"

docker cp "$CSV" "$CONTAINER:$CSV_CONTAINER" >/dev/null

PRELUDIO="$TMP/preludio.sql"
{
  echo 'BEGIN;'
  cat "$MIGRATION_PROVENIENCIA"
  cat <<'SQL'

ALTER TABLE public.trees
  ADD COLUMN IF NOT EXISTS dap_20a_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_20a_min_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_20a_max_cm numeric,
  ADD COLUMN IF NOT EXISTS altura_20a_m numeric,
  ADD COLUMN IF NOT EXISTS altura_20a_min_m numeric,
  ADD COLUMN IF NOT EXISTS altura_20a_max_m numeric,
  ADD COLUMN IF NOT EXISTS dap_30a_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_30a_min_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_30a_max_cm numeric,
  ADD COLUMN IF NOT EXISTS altura_30a_m numeric,
  ADD COLUMN IF NOT EXISTS altura_30a_min_m numeric,
  ADD COLUMN IF NOT EXISTS altura_30a_max_m numeric;

TRUNCATE public.trees CASCADE;
SQL
  echo "\\copy public.trees ($COLUNAS) FROM '$CSV_CONTAINER' WITH (FORMAT csv, HEADER true, NULL 'null')"
  cat "$MIGRATION_INATIVAR"
  echo
} > "$PRELUDIO"

# Execução A: carga + pós-carga.
{
  cat "$PRELUDIO"
  sem_transacao "$SQL_01"
  cat "$SQL_02"
  echo 'ROLLBACK;'
} > "$TMP/execucao_a.sql"

STATUS_A=0
psql_local < "$TMP/execucao_a.sql" > "$TMP/a.out" 2> "$TMP/a.err" || STATUS_A=$?

echo
echo "=== Execução A (prelúdio → 01 → 02 → ROLLBACK): exit $STATUS_A ==="
cat "$TMP/a.out"
echo "--- stderr ---"
cat "$TMP/a.err"

# Execução B: carga duas vezes; a segunda tem de parar na trava de reexecução.
{
  cat "$PRELUDIO"
  sem_transacao "$SQL_01"
  sem_transacao "$SQL_01"
  echo 'ROLLBACK;'
} > "$TMP/execucao_b.sql"

STATUS_B=0
psql_local < "$TMP/execucao_b.sql" > "$TMP/b.out" 2> "$TMP/b.err" || STATUS_B=$?

echo
echo "=== Execução B (prelúdio → 01 → 01 → ROLLBACK): exit $STATUS_B ==="
cat "$TMP/b.out"
echo "--- stderr ---"
cat "$TMP/b.err"

DEPOIS="$(estado_banco)"

echo
echo "=== Resumo ==="
FALHOU=0

if [[ $STATUS_A -eq 0 ]] && grep -qF "$MSG_OK" "$TMP/a.err"; then
  echo "OK    A: carga e pós-carga passaram (exit 0, \"$MSG_OK\")."
else
  echo "FALHA A: esperado exit 0 e \"$MSG_OK\"; exit $STATUS_A."
  FALHOU=1
fi

if [[ $STATUS_B -ne 0 ]] && grep -qF "$MSG_REEXECUCAO" "$TMP/b.err"; then
  echo "OK    B: segunda execução do 01 abortou pela trava de reexecução (exit $STATUS_B)."
else
  echo "FALHA B: esperado exit ≠ 0 e \"$MSG_REEXECUCAO\"; exit $STATUS_B."
  FALHOU=1
fi

echo "Banco local depois: $DEPOIS"
if [[ "$DEPOIS" == "$ANTES" && "$DEPOIS" == *"tree_value_provenance=ausente"* ]]; then
  echo "OK    Banco local intacto (igual ao início, sem tree_value_provenance)."
else
  echo "FALHA Banco local mudou ou ficou com tree_value_provenance (antes: $ANTES)."
  FALHOU=1
fi

exit $FALHOU
