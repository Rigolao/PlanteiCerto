#!/bin/bash
# Instala o monitoramento na VPS. Rodar como root, a partir da pasta ops/monitoramento copiada
# para a VPS:  ALERT_TO=email@exemplo.com bash install.sh
# Idempotente: pode ser rodado de novo para atualizar os scripts.
set -euo pipefail
: "${ALERT_TO:?defina ALERT_TO com o e-mail que recebe os alertas}"
cd "$(dirname "$0")"

install -d -m 755 /opt/planteicerto-health
install -m 755 healthcheck.py report.sh /opt/planteicerto-health/
install -d -m 700 /var/lib/planteicerto-health

if [ ! -f /etc/planteicerto-health.conf ]; then
  umask 077
  printf 'ALERT_TO=%s\nSUPABASE_ENV=/root/supabase/docker/.env\n' "$ALERT_TO" > /etc/planteicerto-health.conf
fi

install -m 644 planteicerto-health.service planteicerto-health.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now planteicerto-health.timer

# O backup.sh passa a registrar a hora da última execução bem-sucedida (para o check "backup").
# A linha vai depois do último tar e não escreve nada no stdout, então não interfere no arquivo
# que o Mac recebe.
MARK='date +%s > /var/lib/planteicerto-health/last-backup 2>/dev/null || true'
if ! grep -qF "$MARK" /root/backup.sh; then
  cp /root/backup.sh /root/backup.sh.bak-$(date +%Y%m%d)
  printf '\n%s\n' "$MARK" >> /root/backup.sh
fi

systemctl start planteicerto-health.service || true
systemctl list-timers planteicerto-health.timer --no-pager | head -3
python3 -c 'import json; r=json.load(open("/var/lib/planteicerto-health/latest.json")); print("ok geral:", r["ok"])'
