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
#   Execução C: prelúdio → UPDATE de 4 valores da parametrização/consolidação
#               (número, sem_dado preenchido, booleano, texto) → 01 → ROLLBACK.
#               Exige exit ≠ 0 e a mensagem da trava 2b com os 4 (tree_id, campo).
#
# Antes de rodar, recusa qualquer controle de transação (BEGIN/COMMIT/ROLLBACK/END…)
# nas migrations, no 01 (fora o BEGIN;/COMMIT; removidos) e no 02: um COMMIT no meio
# efetivaria o TRUNCATE no banco local.
#
# Sai 0 só se A passar, B e C falharem pelas travas esperadas e o banco local terminar
# igual ao início (contagens de trees/points/user_favorites e de
# tree_value_provenance, ou a ausência dela).

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
MSG_TRAVA_2B="4 de 1033 valores da parametrização e da consolidação divergem de public.trees (exemplos: 19 epoca_floracao, 200 tolerancia_sol_pleno, 217 porte_altura_classe, 217 tolerancia_seca_1a5)"

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

sem_transacao() {
  sed -e '/^BEGIN;$/d' -e '/^COMMIT;$/d' "$1"
}

# Lista (e sai 1 se houver) linhas com controle de transação. Ignora comentários `--`.
# COMMIT/ROLLBACK/ABORT são recusados em qualquer lugar; BEGIN, START TRANSACTION e
# END; só fora de corpos $$ … $$, onde não são o BEGIN/END de bloco PL/pgSQL.
controle_transacao() {
  awk '
    function proibido(trecho, dentro,   n, partes, i, frag) {
      n = split(trecho, partes, ";")
      for (i = 1; i <= n; i++) {
        frag = partes[i]
        sub(/^[[:space:]]+/, "", frag)
        if (frag ~ /^(COMMIT|ROLLBACK|ABORT)([^A-Z0-9_]|$)/) return 1
        if (!dentro && frag ~ /^(BEGIN|START[[:space:]]+TRANSACTION)([^A-Z0-9_]|$)/) return 1
        if (!dentro && i < n && frag ~ /^END([[:space:]]+(WORK|TRANSACTION))?[[:space:]]*$/) return 1
      }
      return 0
    }
    {
      linha = toupper($0)
      sub(/--.*$/, "", linha)
      n = split(linha, segmentos, "[$][$]")
      for (j = 1; j <= n; j++) {
        if (j > 1) dentro = !dentro
        if (proibido(segmentos[j], dentro)) {
          printf "  linha %d: %s\n", NR, $0
          achou = 1
          break
        }
      }
    }
    END { exit achou }
  '
}

exigir_sem_controle() {
  local rotulo="$1"
  local achados
  if ! achados="$(controle_transacao)"; then
    echo "ERRO: $rotulo tem controle de transação, que poderia efetivar o TRUNCATE no banco local:" >&2
    echo "$achados" >&2
    exit 1
  fi
}

# O 01 precisa ter exatamente um BEGIN; e um COMMIT; em linhas próprias: são as
# linhas removidas para que ele rode dentro da transação do teste.
if [[ "$(grep -c '^BEGIN;$' "$SQL_01")" != 1 || "$(grep -c '^COMMIT;$' "$SQL_01")" != 1 ]]; then
  echo "ERRO: $SQL_01 deve ter exatamente uma linha 'BEGIN;' e uma 'COMMIT;'." >&2
  exit 1
fi
exigir_sem_controle "$SQL_01 (sem as linhas BEGIN;/COMMIT;)" < <(sem_transacao "$SQL_01")
exigir_sem_controle "$SQL_02" < "$SQL_02"
exigir_sem_controle "$MIGRATION_PROVENIENCIA" < "$MIGRATION_PROVENIENCIA"
exigir_sem_controle "$MIGRATION_INATIVAR" < "$MIGRATION_INATIVAR"

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
  psql_local -At -F ' ' <<'SQL' | paste -s -d ' ' -
SELECT 'arvores=' || (SELECT count(*) FROM public.trees),
       'ativas=' || (SELECT count(*) FROM public.trees WHERE ativa),
       'points=' || (SELECT count(*) FROM public.points),
       'favoritos=' || (SELECT count(*) FROM public.user_favorites);
SELECT to_regclass('public.tree_value_provenance') IS NOT NULL AS tem_proveniencia \gset
\if :tem_proveniencia
SELECT 'tree_value_provenance=' || count(*) FROM public.tree_value_provenance;
\else
SELECT 'tree_value_provenance=ausente';
\endif
SQL
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

# Execução B: carga duas vezes; a segunda tem de parar na trava de reexecução.
{
  cat "$PRELUDIO"
  sem_transacao "$SQL_01"
  sem_transacao "$SQL_01"
  echo 'ROLLBACK;'
} > "$TMP/execucao_b.sql"

# Execução C: valores editados depois da exportação; o 01 tem de parar na trava 2b.
{
  cat "$PRELUDIO"
  cat <<'SQL'
UPDATE public.trees SET tolerancia_seca_1a5 = CASE WHEN tolerancia_seca_1a5 = 5 THEN 4 ELSE 5 END WHERE id = 217;
UPDATE public.trees SET porte_altura_classe = 'Grande' WHERE id = 217;
UPDATE public.trees SET tolerancia_sol_pleno = NOT tolerancia_sol_pleno WHERE id = 200;
UPDATE public.trees SET epoca_floracao = epoca_floracao || ' (editado)' WHERE id = 19;
SQL
  sem_transacao "$SQL_01"
  echo 'ROLLBACK;'
} > "$TMP/execucao_c.sql"

# Guarda final: cada execução abre com o único BEGIN; e fecha com o único ROLLBACK;.
for execucao in a b c; do
  arquivo="$TMP/execucao_$execucao.sql"
  if [[ "$(head -n 1 "$arquivo")" != 'BEGIN;' || "$(tail -n 1 "$arquivo")" != 'ROLLBACK;' ]]; then
    echo "ERRO: execução ${execucao} não está entre BEGIN; e ROLLBACK;." >&2
    exit 1
  fi
  exigir_sem_controle "execução ${execucao} montada" < <(sed '1d;$d' "$arquivo")
done

rodar() {
  local execucao="$1" titulo="$2" status=0
  psql_local < "$TMP/execucao_$execucao.sql" > "$TMP/$execucao.out" 2> "$TMP/$execucao.err" || status=$?
  echo "$status" > "$TMP/$execucao.status"
  echo
  echo "=== $titulo: exit $status ==="
  cat "$TMP/$execucao.out"
  echo "--- stderr ---"
  cat "$TMP/$execucao.err"
}

rodar a "Execução A (prelúdio → 01 → 02 → ROLLBACK)"
rodar b "Execução B (prelúdio → 01 → 01 → ROLLBACK)"
rodar c "Execução C (prelúdio → UPDATE de 4 valores → 01 → ROLLBACK)"

STATUS_A="$(cat "$TMP/a.status")"
STATUS_B="$(cat "$TMP/b.status")"
STATUS_C="$(cat "$TMP/c.status")"
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

if [[ $STATUS_C -ne 0 ]] && grep -qF "$MSG_TRAVA_2B" "$TMP/c.err"; then
  echo "OK    C: valores editados depois da exportação abortaram o 01 pela trava 2b (exit $STATUS_C)."
else
  echo "FALHA C: esperado exit ≠ 0 e \"$MSG_TRAVA_2B\"; exit $STATUS_C."
  FALHOU=1
fi

echo "Banco local depois: $DEPOIS"
if [[ "$DEPOIS" == "$ANTES" ]]; then
  echo "OK    Banco local intacto (igual ao início)."
else
  echo "FALHA Banco local mudou (antes: $ANTES)."
  FALHOU=1
fi

exit $FALHOU
