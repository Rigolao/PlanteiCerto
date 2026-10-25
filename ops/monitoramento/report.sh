#!/bin/bash
# Comando forçado da chave SSH somente leitura do Grok bot (authorized_keys: command=...).
# Não aceita argumentos: devolve o último resultado e um resumo das últimas 24 h.
set -euo pipefail
DIR=/var/lib/planteicerto-health

echo "=== ÚLTIMA VERIFICAÇÃO ==="
if [ -f "$DIR/latest.json" ]; then cat "$DIR/latest.json"; else echo '{"erro":"sem verificação ainda"}'; fi
echo
echo "=== FALHAS NAS ÚLTIMAS 24 H (check: ocorrências; último detalhe) ==="
if [ -f "$DIR/history.jsonl" ]; then
  python3 - "$DIR/history.jsonl" <<'PY'
import json, sys, datetime as dt
limite = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=24)
cont, ultimo, total = {}, {}, 0
for linha in open(sys.argv[1], encoding="utf-8"):
    r = json.loads(linha)
    if dt.datetime.fromisoformat(r["timestamp"]) < limite:
        continue
    total += 1
    for c in r["results"]:
        if not c["ok"]:
            cont[c["check"]] = cont.get(c["check"], 0) + 1
            ultimo[c["check"]] = f'{r["timestamp"]} {c["detail"]}'
print(f"{total} verificações nas últimas 24 h")
for k, n in sorted(cont.items()):
    print(f"{k}: {n}; {ultimo[k]}")
if not cont:
    print("nenhuma falha")
PY
fi
