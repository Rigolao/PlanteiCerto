# Runbook: Storage/MinIO retorna HTTP 500

## Sintoma

Imagens, guias ou critérios deixam de carregar e a API do Storage retorna:

```json
{
  "statusCode": "500",
  "error": "Internal",
  "message": "Internal Server Error",
  "code": "InternalError"
}
```

## Causa registrada

Em 2026-09-09, os arquivos dos buckets estavam íntegros, mas o container
`supabase-minio-1` estava parado com `Exited (255)`. O container
`supabase-storage` continuava saudável, porém não conseguia resolver/conectar ao
endpoint configurado `http://minio:9000`. O erro observado nos logs foi:

```text
TimeoutError: Socket timed out without establishing a connection within 5000 ms
```

Não foi corrupção dos arquivos nem falta de memória (`OOM=false`).

## Diagnóstico rápido

```bash
docker ps -a --filter name=supabase-minio \
  --format "table {{.Names}}\t{{.Status}}\t{{.Networks}}"

docker logs supabase-storage --tail 120 2>&1

docker exec supabase-storage getent hosts minio

docker exec supabase-storage sh -c \
  'wget -S -O- http://minio:9000/minio/health/live 2>&1'
```

Se `minio` não resolver, ou não houver resposta HTTP `200`, verificar o
container MinIO e sua rede Docker:

```bash
docker inspect supabase-minio-1 \
  --format '{{json .NetworkSettings.Networks}}'

docker inspect supabase-minio-1 \
  --format 'Status={{.State.Status}} Exit={{.State.ExitCode}} OOM={{.State.OOMKilled}} Error={{.State.Error}} Finished={{.State.FinishedAt}}'
```

## Recuperação

Na VPS, iniciar o serviço pelo compose oficial, reutilizando o volume existente:

```bash
cd /root/supabase/docker

docker compose \
  -f docker-compose.yml \
  -f docker-compose.s3.yml \
  -f docker-compose.caddy.yml \
  up -d minio
```

Validar novamente:

```bash
docker exec supabase-storage getent hosts minio

docker exec supabase-storage sh -c \
  'wget -S -O- http://minio:9000/minio/health/live 2>&1'
```

O volume usado nesta instalação é:

```text
supabase_minio-data
/var/lib/docker/volumes/supabase_minio-data/_data
```

## Não restaurar os buckets imediatamente

Antes de substituir o volume, validar os arquivos. No incidente registrado,
foram encontrados 153 payloads, 233 metadados e nenhum arquivo vazio. Os hashes
dos payloads atuais coincidiram com o backup, provando que o problema era a
indisponibilidade do MinIO, não os dados.

Se for necessário comparar com um backup, extraí-lo em uma pasta separada, sem
misturar com o volume ativo:

```bash
mkdir -p /root/restore-YYYY-MM-DD/storage-extracted
tar -xzf /root/restore-YYYY-MM-DD/storage.tar.gz \
  -C /root/restore-YYYY-MM-DD/storage-extracted
```

Só considerar restauração depois de comparar contagem e SHA-256 dos arquivos.
Não restaurar `db.dump` apenas porque os objetos não carregam: isso pode
sobrescrever dados atuais e criar divergência entre `storage.objects` e o
volume do MinIO.

## Verificação final

```bash
curl -sS -o /dev/null \
  -w "criterios: HTTP %{http_code}\n" \
  https://api.planteicerto.com.br/storage/v1/object/public/criterios/parametrizacao_simples.pdf

curl -sS -o /dev/null \
  -w "guias: HTTP %{http_code}\n" \
  https://api.planteicerto.com.br/storage/v1/object/public/guias/guia1.pdf

curl -sS -o /dev/null \
  -w "tree-images: HTTP %{http_code}\n" \
  https://api.planteicerto.com.br/storage/v1/object/public/tree-images/images/luehea-divaricata.jpg
```

Esperado: HTTP `200` nos três endpoints.

