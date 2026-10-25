#!/usr/bin/env python3
"""Verificação de saúde do PlanteiCerto em produção (roda na VPS, só lê).

Executado a cada 15 minutos pelo timer systemd `planteicerto-health.timer`.
Grava o resultado em /var/lib/planteicerto-health/ e manda e-mail (SMTP do
Brevo configurado no .env do Supabase) quando algum check muda de estado.

Configuração em /etc/planteicerto-health.conf (formato KEY=VALUE):
  ALERT_TO=destinatario@exemplo.com
  SUPABASE_ENV=/root/supabase/docker/.env        (opcional)

Uso manual:  python3 healthcheck.py [--no-email] [--full]
"""

from __future__ import annotations

import datetime as dt
import json
import os
import shutil
import smtplib
import socket
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request
from email.message import EmailMessage
from pathlib import Path

STATE_DIR = Path(os.environ.get("PLANTEICERTO_HEALTH_DIR", "/var/lib/planteicerto-health"))
LATEST = STATE_DIR / "latest.json"
HISTORY = STATE_DIR / "history.jsonl"
FULL_PHOTOS_STAMP = STATE_DIR / "last-full-photos"
LAST_BACKUP = STATE_DIR / "last-backup"
CONF = Path("/etc/planteicerto-health.conf")

SITE_URL = "https://www.planteicerto.com.br"
API_URL = "https://api.planteicerto.com.br"
TLS_HOSTS = ["api.planteicerto.com.br", "www.planteicerto.com.br"]
ONE_SHOT_CONTAINERS = {"supabase-minio-createbucket-1"}
DISK_LIMIT_PCT = 85
TLS_MIN_DAYS = 14
BACKUP_MAX_HOURS = 26
HISTORY_KEEP_DAYS = 30
FULL_PHOTOS_EVERY_H = 24
UA = "PlanteiCerto-Healthcheck/1.0"


def load_kv(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data


def http(url: str, *, method: str = "GET", headers: dict | None = None,
         body: bytes | None = None, timeout: int = 20,
         max_bytes: int | None = 256 * 1024) -> tuple[int, bytes]:
    req = urllib.request.Request(url, data=body, method=method,
                                 headers={"User-Agent": UA, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read() if max_bytes is None else resp.read(max_bytes)
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read(4096) if exc.fp else b""


def run(cmd: list[str], timeout: int = 30) -> str:
    return subprocess.run(cmd, check=True, capture_output=True, text=True,
                          timeout=timeout).stdout


def psql(sql: str) -> str:
    return run(["docker", "exec", "-i", "supabase-db", "psql", "-U", "postgres",
                "-d", "postgres", "-Atc", sql]).strip()


def result(name: str, ok: bool, detail: str, **extra) -> dict:
    return {"check": name, "ok": ok, "detail": detail, **extra}


# ── Checks ────────────────────────────────────────────────────────────────

def check_site() -> dict:
    status, _ = http(SITE_URL)
    return result("site", status == 200, f"{SITE_URL} → HTTP {status}")


def check_api(anon: str) -> dict:
    status, _ = http(f"{API_URL}/rest/v1/trees?select=id&limit=1",
                     headers={"apikey": anon, "Authorization": f"Bearer {anon}"})
    return result("api_rest", status == 200, f"REST /trees → HTTP {status}")


def check_db() -> dict:
    raw = psql("select count(*), count(*) filter (where ativa), "
               "(select count(*) from public.tree_value_provenance) from public.trees")
    total, ativas, prov = (int(x) for x in raw.split("|"))
    ok = ativas > 0 and prov > 0
    return result("banco", ok, f"{total} árvores, {ativas} ativas, {prov} registros de proveniência",
                  counts={"arvores": total, "ativas": ativas, "proveniencia": prov})


def active_photo_urls() -> list[tuple[str, str]]:
    raw = psql("select id || '|' || foto from public.trees where ativa and foto like 'http%' order by id")
    return [tuple(line.split("|", 1)) for line in raw.splitlines() if "|" in line]


def is_image(data: bytes) -> bool:
    return data[:3] == b"\xff\xd8\xff" or data[:4] == b"\x89PNG" or data[:4] == b"RIFF" or data[:3] == b"GIF"


def check_photos(full: bool) -> dict:
    urls = active_photo_urls()
    storage = [(i, u) for i, u in urls if "/storage/v1/" in u]
    sample = storage if full else storage[:1]
    failures = []
    for tree_id, url in sample:
        status, data = http(url.replace(" ", "%20"), timeout=30)
        if status != 200 or not is_image(data):
            failures.append(f"id {tree_id}: HTTP {status}")
    scope = f"todas as {len(sample)} fotos do Storage" if full else "foto de amostra do Storage"
    if full:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        FULL_PHOTOS_STAMP.write_text(str(int(time.time())))
    detail = f"{scope}: OK" if not failures else f"{scope}: {len(failures)} falha(s) — {', '.join(failures[:5])}"
    return result("fotos", not failures, detail, full=full)


def check_edge_function(anon: str) -> dict:
    body = json.dumps({"answers": {"q1_1": "praca_parque", "q3_1": "sol_pleno"}}).encode()
    status, data = http(f"{API_URL}/functions/v1/recommend-trees", method="POST", body=body,
                        headers={"apikey": anon, "Authorization": f"Bearer {anon}",
                                 "Content-Type": "application/json",
                                 "Origin": SITE_URL}, timeout=40, max_bytes=None)
    try:
        payload = json.loads(data)
        n = len(payload.get("trees", []))
    except (ValueError, AttributeError):
        n = 0
    return result("edge_function", status == 200 and n > 0,
                  f"recommend-trees → HTTP {status}, {n} espécie(s) aprovada(s)")


def check_containers() -> dict:
    names = run(["docker", "ps", "-a", "--format", "{{.Names}}"]).split()
    problems = []
    for name in names:
        if name in ONE_SHOT_CONTAINERS:
            continue
        info = run(["docker", "inspect", name, "--format",
                    "{{.State.Status}}|{{.HostConfig.RestartPolicy.Name}}|"
                    "{{if .State.Health}}{{.State.Health.Status}}{{end}}"]).strip()
        status, restart, health = info.split("|")
        if status != "running":
            problems.append(f"{name} {status}")
        if restart in ("", "no"):
            problems.append(f"{name} sem reinício automático")
        if health == "unhealthy":
            problems.append(f"{name} unhealthy")
    detail = f"{len(names) - len(ONE_SHOT_CONTAINERS & set(names))} containers OK" if not problems else "; ".join(problems)
    return result("containers", not problems, detail)


def check_disk() -> dict:
    usage = shutil.disk_usage("/")
    pct = round(usage.used / usage.total * 100)
    return result("disco", pct < DISK_LIMIT_PCT, f"/ em {pct}% (limite {DISK_LIMIT_PCT}%)")


def tls_days_left(host: str) -> float:
    ctx = ssl.create_default_context()
    with socket.create_connection((host, 443), timeout=15) as sock:
        with ctx.wrap_socket(sock, server_hostname=host) as tls:
            not_after = tls.getpeercert()["notAfter"]
    expires = dt.datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=dt.timezone.utc)
    return (expires - dt.datetime.now(dt.timezone.utc)).total_seconds() / 86400


def check_tls() -> dict:
    parts, ok = [], True
    for host in TLS_HOSTS:
        days = tls_days_left(host)
        ok &= days > TLS_MIN_DAYS
        parts.append(f"{host}: {days:.0f} dias")
    return result("certificados", ok, "; ".join(parts))


def check_ssh() -> dict:
    cfg = run(["sshd", "-T"])
    values = dict(line.split(" ", 1) for line in cfg.splitlines() if " " in line)
    pw = values.get("passwordauthentication")
    root = values.get("permitrootlogin")
    f2b = subprocess.run(["systemctl", "is-active", "fail2ban"], capture_output=True, text=True).stdout.strip()
    ok = pw == "no" and root in ("without-password", "prohibit-password") and f2b == "active"
    return result("ssh", ok, f"passwordauthentication={pw}, permitrootlogin={root}, fail2ban={f2b}")


def check_backup() -> dict:
    if not LAST_BACKUP.exists():
        return result("backup", True, "ainda sem registro (o backup.sh passa a registrar a partir do próximo backup)")
    age_h = (time.time() - int(LAST_BACKUP.read_text().strip())) / 3600
    return result("backup", age_h < BACKUP_MAX_HOURS, f"último backup há {age_h:.1f} h (limite {BACKUP_MAX_HOURS} h)")


# ── Execução ──────────────────────────────────────────────────────────────

def run_checks(full_photos: bool) -> list[dict]:
    conf = load_kv(CONF)
    env = load_kv(Path(conf.get("SUPABASE_ENV", "/root/supabase/docker/.env")))
    anon = env.get("ANON_KEY", "")
    checks = [
        check_site, lambda: check_api(anon), check_db, lambda: check_photos(full_photos),
        lambda: check_edge_function(anon), check_containers, check_disk, check_tls,
        check_ssh, check_backup,
    ]
    names = ["site", "api_rest", "banco", "fotos", "edge_function", "containers",
             "disco", "certificados", "ssh", "backup"]
    results = []
    for name, fn in zip(names, checks):
        try:
            results.append(fn())
        except Exception as exc:  # um check quebrado não pode derrubar os outros
            results.append(result(name, False, f"erro ao verificar: {type(exc).__name__}: {exc}"[:300]))
    return results


def send_email(subject: str, text: str) -> None:
    conf = load_kv(CONF)
    to = conf.get("ALERT_TO")
    env = load_kv(Path(conf.get("SUPABASE_ENV", "/root/supabase/docker/.env")))
    if not to or not env.get("SMTP_HOST"):
        print("e-mail não configurado; alerta só no log", file=sys.stderr)
        return
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{env.get('SMTP_SENDER_NAME', 'PlanteiCerto')} <{env.get('SMTP_ADMIN_EMAIL')}>"
    msg["To"] = to
    msg.set_content(text)
    port = int(env.get("SMTP_PORT", "587"))
    with smtplib.SMTP(env["SMTP_HOST"], port, timeout=30) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        smtp.login(env["SMTP_USER"], env["SMTP_PASS"])
        smtp.send_message(msg)


def main() -> int:
    no_email = "--no-email" in sys.argv
    force_full = "--full" in sys.argv
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    if "--test-email" in sys.argv:
        resultados = run_checks(False)
        texto = "\n".join(f"{'OK   ' if r['ok'] else 'FALHA'} {r['check']}: {r['detail']}" for r in resultados)
        send_email("[PlanteiCerto] Teste do monitoramento",
                   "E-mail de teste do monitoramento da VPS. Estado atual:\n\n" + texto)
        print("e-mail de teste enviado")
        return 0

    last_full = int(FULL_PHOTOS_STAMP.read_text()) if FULL_PHOTOS_STAMP.exists() else 0
    full = force_full or (time.time() - last_full) > FULL_PHOTOS_EVERY_H * 3600

    previous = json.loads(LATEST.read_text()) if LATEST.exists() else None
    prev_ok = {r["check"]: r["ok"] for r in previous["results"]} if previous else {}

    results = run_checks(full)
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    report = {"timestamp": now, "ok": all(r["ok"] for r in results), "results": results}

    LATEST.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    with HISTORY.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(report, ensure_ascii=False) + "\n")
    cutoff = time.time() - HISTORY_KEEP_DAYS * 86400
    lines = HISTORY.read_text(encoding="utf-8").splitlines()
    kept = [l for l in lines if dt.datetime.fromisoformat(json.loads(l)["timestamp"]).timestamp() >= cutoff]
    if len(kept) != len(lines):
        HISTORY.write_text("\n".join(kept) + "\n", encoding="utf-8")

    novas_falhas = [r for r in results if not r["ok"] and prev_ok.get(r["check"], True)]
    resolvidas = [r for r in results if r["ok"] and prev_ok.get(r["check"]) is False]
    for r in results:
        print(f"{'OK   ' if r['ok'] else 'FALHA'} {r['check']}: {r['detail']}")

    if not no_email and (novas_falhas or resolvidas):
        linhas = [f"Verificação de {now} (VPS PlanteiCerto)", ""]
        if novas_falhas:
            linhas.append("FALHAS NOVAS:")
            linhas += [f"  - {r['check']}: {r['detail']}" for r in novas_falhas]
            linhas.append("")
        if resolvidas:
            linhas.append("RESOLVIDAS:")
            linhas += [f"  - {r['check']}: {r['detail']}" for r in resolvidas]
            linhas.append("")
        linhas.append("Estado completo:")
        linhas += [f"  {'OK   ' if r['ok'] else 'FALHA'} {r['check']}: {r['detail']}" for r in results]
        linhas += ["", "Runbooks: INFRAESTRUTURA.md e docs/runbook-storage-minio.md no repositório."]
        tipo = "ALERTA" if novas_falhas else "RESOLVIDO"
        nomes = ", ".join(r["check"] for r in (novas_falhas or resolvidas))
        try:
            send_email(f"[PlanteiCerto] {tipo}: {nomes}", "\n".join(linhas))
        except Exception as exc:
            print(f"falha ao enviar e-mail: {exc}", file=sys.stderr)

    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
