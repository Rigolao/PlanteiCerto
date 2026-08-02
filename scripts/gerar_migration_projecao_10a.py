#!/usr/bin/env python3
"""
Gera o mapeamento xlsx -> trees.id e a migration de backfill da projecao de 10 anos.

A planilha do orientador (`dados_app_projecao_10_anos_especies_cartilha.xlsx`) usa
`especie_id` proprio (1..136) que NAO corresponde a `trees.id`, e nomenclatura
taxonomica atualizada enquanto o banco ainda usa os sinonimos antigos
(ex.: banco `Tabebuia chrysotricha` vs planilha `Handroanthus chrysotrichus`).
Por isso o casamento e feito aqui, revisado, e gravado explicitamente na migration
como uma lista de `trees.id` — nunca por `WHERE nome_cientifico = ...`.

Uso:
    python3 scripts/gerar_migration_projecao_10a.py mapear   # gera scripts/mapa_projecao_10a.csv
    python3 scripts/gerar_migration_projecao_10a.py sql      # gera a migration a partir do CSV

O modo `mapear` le a tabela `trees` do Postgres local via docker.
"""

import csv
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
XLSX = Path.home() / 'Downloads' / 'dados_app_projecao_10_anos_especies_cartilha.xlsx'
CSV_MAPA = RAIZ / 'scripts' / 'mapa_projecao_10a.csv'
MIGRATION = RAIZ / 'supabase' / 'migrations' / '20260802000000_add_projecao_10a_to_trees.sql'
ABA = 'projecao_10a_app'
CONTAINER_DB = 'supabase_db_PlanteiCerto'

# xlsx -> coluna no Postgres. As demais colunas da planilha ou sao constantes
# (dap_inicial_cm=3, altura_inicial_m=1.5, cenario_plantio, horizonte_anos=10)
# ou sao chave de join (especie_id, nome_popular, nome_cientifico).
COLUNAS = [
    ('dap_10a_cm', 'dap_10a_cm', 'num'),
    ('dap_10a_min_cm', 'dap_10a_min_cm', 'num'),
    ('dap_10a_max_cm', 'dap_10a_max_cm', 'num'),
    ('altura_10a_m', 'altura_10a_m', 'num'),
    ('altura_10a_min_m', 'altura_10a_min_m', 'num'),
    ('altura_10a_max_m', 'altura_10a_max_m', 'num'),
    ('biomassa_aerea_10a_kg', 'biomassa_aerea_10a_kg', 'num'),
    ('carbono_armazenado_10a_kg_c', 'carbono_armazenado_10a_kg', 'num'),
    ('co2e_equivalente_10a_kg', 'co2e_10a_kg', 'num'),
    ('sobrevivencia_10a_pct', 'sobrevivencia_10a_pct', 'num'),
    ('co2e_esperado_por_muda_10a_kg', 'co2e_esperado_por_muda_10a_kg', 'num'),
    ('classe_bvoc', 'classe_bvoc', 'txt'),
    ('evidencia_bvoc', 'evidencia_bvoc', 'txt'),
    ('confianca', 'confianca_bvoc', 'txt'),
    ('exibir_aviso', 'exibir_aviso_bvoc', 'bool'),
]

CASAS_DECIMAIS = 4

# Casos em que o casamento automatico e ambiguo (uma linha do banco bate com varias
# da planilha, ou vice-versa). trees.id -> especie_id, ou None para deixar sem dado.
OVERRIDES = {
    # Ipe-amarelo: 4 linhas no banco com nomenclatura Tabebuia, 4 na planilha com
    # Handroanthus. Casamento 1:1 por sinonimo.
    145: 65,    # Tabebuia chrysotricha = Handroanthus chrysotrichus
    146: 66,    # Tabebuia aurea        = Handroanthus caraiba
    147: 67,    # Tabebuia ochracea     = Handroanthus ochraceus
    148: 68,    # Tabebuia serratifolia = Handroanthus serratifolius
    # Calistemon: a planilha repete Melaleuca viminalis (= Callistemon viminalis) em
    # duas linhas identicas, espelhando as duas entradas do banco.
    112: 22,
    113: 23,
    # Idem para Ipe-roxo-de-bola, duplicado no banco: a planilha traz Handroanthus
    # impetiginosus em 3 linhas com valores identicos (anao / da-mata / de-bola).
    23: 75,
    99: 75,
    # Mulungu: o banco tem Erythrina falcata (auto) e Erythrina mulungu, que na
    # planilha aparece como Erythrina verna.
    173: 97,
}


def normalizar(texto):
    texto = unicodedata.normalize('NFKD', str(texto or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', texto)).strip()


def genero_especie(nome):
    return ' '.join(normalizar(nome).split()[:2])


def nomes_populares(campo):
    """O banco guarda varios nomes populares num campo so, separados por ; ou ,"""
    return [normalizar(p) for p in re.split(r'[;,]', str(campo or '')) if normalizar(p)]


def ler_planilha():
    import openpyxl
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    linhas = list(wb[ABA].iter_rows(values_only=True))
    cabecalho = linhas[0]
    return [dict(zip(cabecalho, l)) for l in linhas[1:] if l[0] is not None]


def ler_arvores():
    saida = subprocess.run(
        ['docker', 'exec', CONTAINER_DB, 'psql', '-U', 'postgres', '-d', 'postgres',
         '-At', '-F', '\t', '-c',
         'select id, nome_popular, nome_cientifico, ativa from public.trees order by id'],
        capture_output=True, text=True, check=True,
    ).stdout
    arvores = []
    for linha in saida.splitlines():
        partes = linha.split('\t')
        if len(partes) == 4:
            arvores.append({
                'id': int(partes[0]),
                'nome_popular': partes[1],
                'nome_cientifico': partes[2],
                'ativa': partes[3] == 't',
            })
    return arvores


def mapear():
    planilha = ler_planilha()
    arvores = ler_arvores()

    por_id = {p['especie_id']: p for p in planilha}
    por_cientifico = {}
    por_popular = {}
    for p in planilha:
        por_cientifico.setdefault(genero_especie(p['nome_cientifico']), []).append(p)
        for nome in nomes_populares(p['nome_popular']):
            por_popular.setdefault(nome, []).append(p)

    linhas, sem_match = [], []
    for arvore in arvores:
        if arvore['id'] in OVERRIDES:
            alvo = OVERRIDES[arvore['id']]
            if alvo is None:
                sem_match.append((arvore, 'override: sem linha correspondente'))
                continue
            especie, metodo = por_id[alvo], 'override'
        else:
            candidatos = por_cientifico.get(genero_especie(arvore['nome_cientifico']))
            metodo = 'nome_cientifico'
            if not candidatos:
                for nome in nomes_populares(arvore['nome_popular']):
                    if nome in por_popular:
                        candidatos, metodo = por_popular[nome], 'nome_popular'
                        break
            if not candidatos:
                sem_match.append((arvore, 'nenhum candidato'))
                continue
            if len({c['especie_id'] for c in candidatos}) > 1 and \
                    len({tuple(str(c[o]) for o, _, _ in COLUNAS) for c in candidatos}) > 1:
                sem_match.append((arvore, 'ambiguo: %s' % [c['especie_id'] for c in candidatos]))
                continue
            especie = candidatos[0]

        linhas.append({
            'tree_id': arvore['id'],
            'ativa': 't' if arvore['ativa'] else 'f',
            'nome_popular_banco': arvore['nome_popular'],
            'nome_cientifico_banco': arvore['nome_cientifico'],
            'especie_id': especie['especie_id'],
            'nome_cientifico_planilha': especie['nome_cientifico'],
            'metodo': metodo,
        })

    # Uma mesma linha da planilha so pode servir a arvores que sejam de fato a mesma
    # especie (as 14 duplicatas ativas do banco). Nome popular divergente indica
    # casamento errado — foi assim que `especie_id` 58 (Grumixama) apareceu ligado ao
    # Ipe-amarelo na primeira rodada.
    suspeitas = {}
    for linha in linhas:
        suspeitas.setdefault(linha['especie_id'], []).append(linha)
    for especie_id, grupo in sorted(suspeitas.items()):
        populares = {normalizar(g['nome_popular_banco'].split(';')[0]) for g in grupo}
        if len(populares) > 1:
            print('ALERTA especie_id=%s serve a nomes populares diferentes: %s' % (
                especie_id, [(g['tree_id'], g['nome_popular_banco']) for g in grupo]))

    CSV_MAPA.parent.mkdir(parents=True, exist_ok=True)
    with CSV_MAPA.open('w', newline='', encoding='utf-8') as f:
        escritor = csv.DictWriter(f, fieldnames=list(linhas[0].keys()))
        escritor.writeheader()
        escritor.writerows(linhas)

    usados = {l['especie_id'] for l in linhas}
    print('mapeadas: %d de %d arvores do banco -> %s' % (len(linhas), len(arvores), CSV_MAPA))
    print('  por nome cientifico: %d | por nome popular: %d | override: %d' % (
        sum(1 for l in linhas if l['metodo'] == 'nome_cientifico'),
        sum(1 for l in linhas if l['metodo'] == 'nome_popular'),
        sum(1 for l in linhas if l['metodo'] == 'override'),
    ))
    print('\narvores do banco sem projecao (%d):' % len(sem_match))
    for arvore, motivo in sem_match:
        print('  id=%-4s ativa=%s %-45s %-35s %s' % (
            arvore['id'], 't' if arvore['ativa'] else 'f',
            arvore['nome_popular'][:45], arvore['nome_cientifico'][:35], motivo))
    print('\nlinhas da planilha nao usadas (%d):' % (len(planilha) - len(usados)))
    for p in planilha:
        if p['especie_id'] not in usados:
            print('  especie_id=%-4s %-35s %s' % (
                p['especie_id'], p['nome_popular'][:35], p['nome_cientifico']))


def literal(valor, tipo):
    if tipo == 'num':
        return repr(round(float(valor), CASAS_DECIMAIS))
    if tipo == 'bool':
        return 'true' if valor in (True, 'True', 'true') else 'false'
    return "'" + str(valor).replace("'", "''") + "'"


def gerar_sql():
    planilha = {p['especie_id']: p for p in ler_planilha()}
    with CSV_MAPA.open(encoding='utf-8') as f:
        mapa = list(csv.DictReader(f))

    tuplas = []
    for indice, linha in enumerate(mapa):
        especie = planilha[int(linha['especie_id'])]
        valores = ', '.join(literal(especie[origem], tipo) for origem, _, tipo in COLUNAS)
        virgula = '' if indice == len(mapa) - 1 else ','
        tuplas.append('    (%s, %s)%s  -- %s' % (
            linha['tree_id'], valores, virgula, linha['nome_popular_banco'].replace('\n', ' '),
        ))

    colunas_destino = [destino for _, destino, _ in COLUNAS]
    sets = ',\n'.join('  %s = v.%s' % (c, c) for c in colunas_destino)
    corpo = '\n'.join(tuplas)

    sql = f"""-- Projecao de crescimento em 10 anos por especie
-- Fonte: dados_app_projecao_10_anos_especies_cartilha.xlsx (orientador)
-- Cenario fixo da planilha: muda inicial de DAP 3 cm / altura 1,5 m, "boas condicoes",
-- horizonte de 10 anos. Por serem constantes em todas as linhas, viram texto fixo na
-- UI em vez de coluna.
--
-- O mapeamento especie_id (planilha) -> trees.id esta em scripts/mapa_projecao_10a.csv,
-- gerado e revisado por scripts/gerar_migration_projecao_10a.py. E explicito porque o
-- banco usa nomenclatura antiga (ex.: Tabebuia chrysotricha) e a planilha a atualizada
-- (Handroanthus chrysotrichus).

ALTER TABLE public.trees
  ADD COLUMN IF NOT EXISTS dap_10a_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_10a_min_cm numeric,
  ADD COLUMN IF NOT EXISTS dap_10a_max_cm numeric,
  ADD COLUMN IF NOT EXISTS altura_10a_m numeric,
  ADD COLUMN IF NOT EXISTS altura_10a_min_m numeric,
  ADD COLUMN IF NOT EXISTS altura_10a_max_m numeric,
  ADD COLUMN IF NOT EXISTS biomassa_aerea_10a_kg numeric,
  ADD COLUMN IF NOT EXISTS carbono_armazenado_10a_kg numeric,
  ADD COLUMN IF NOT EXISTS co2e_10a_kg numeric,
  ADD COLUMN IF NOT EXISTS sobrevivencia_10a_pct numeric,
  ADD COLUMN IF NOT EXISTS co2e_esperado_por_muda_10a_kg numeric,
  ADD COLUMN IF NOT EXISTS classe_bvoc text,
  ADD COLUMN IF NOT EXISTS evidencia_bvoc text,
  ADD COLUMN IF NOT EXISTS confianca_bvoc text,
  ADD COLUMN IF NOT EXISTS exibir_aviso_bvoc boolean DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trees_sobrevivencia_10a_pct_check') THEN
    ALTER TABLE public.trees ADD CONSTRAINT trees_sobrevivencia_10a_pct_check
      CHECK (sobrevivencia_10a_pct >= 0 AND sobrevivencia_10a_pct <= 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trees_classe_bvoc_check') THEN
    ALTER TABLE public.trees ADD CONSTRAINT trees_classe_bvoc_check
      CHECK (classe_bvoc = ANY (ARRAY['baixo'::text, 'moderado'::text, 'alto'::text, 'desconhecido'::text, 'indeterminado'::text]));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trees_confianca_bvoc_check') THEN
    ALTER TABLE public.trees ADD CONSTRAINT trees_confianca_bvoc_check
      CHECK (confianca_bvoc = ANY (ARRAY['baixa'::text, 'baixa-média'::text, 'média'::text, 'média-alta'::text]));
  END IF;
END $$;

COMMENT ON COLUMN public.trees.dap_10a_cm IS 'DAP projetado aos 10 anos (cm), cenario boas condicoes, muda inicial 3 cm';
COMMENT ON COLUMN public.trees.altura_10a_m IS 'Altura projetada aos 10 anos (m), cenario boas condicoes, muda inicial 1,5 m';
COMMENT ON COLUMN public.trees.carbono_armazenado_10a_kg IS 'Carbono na biomassa aerea aos 10 anos (kg C) = biomassa x 0,47';
COMMENT ON COLUMN public.trees.co2e_10a_kg IS 'CO2 equivalente aos 10 anos (kg) = carbono x 3,6667';
COMMENT ON COLUMN public.trees.co2e_esperado_por_muda_10a_kg IS 'CO2e esperado por muda plantada aos 10 anos (kg), ja ponderado pela sobrevivencia';
COMMENT ON COLUMN public.trees.classe_bvoc IS 'Classe de emissao de compostos organicos volateis biogenicos';
COMMENT ON COLUMN public.trees.exibir_aviso_bvoc IS 'Sinaliza que a classificacao BVOC tem baixa evidencia e merece ressalva na UI';

-- Backfill: {len(mapa)} linhas. Idempotente (UPDATE por id), pode rodar de novo.
UPDATE public.trees AS t SET
{sets}
FROM (VALUES
{corpo}
) AS v(tree_id, {', '.join(colunas_destino)})
WHERE t.id = v.tree_id;
"""

    MIGRATION.write_text(sql, encoding='utf-8')
    print('migration escrita: %s (%d linhas de backfill)' % (MIGRATION, len(mapa)))


def regerar_seed():
    """
    Reescreve o INSERT de `trees` em supabase/seed.sql a partir do banco local.

    Necessario porque `supabase db reset` roda as migrations ANTES do seed: num banco
    zerado o UPDATE de backfill da migration nao encontra linha nenhuma. O seed precisa
    ja trazer as colunas de projecao preenchidas. Mantem o formato do arquivo (um INSERT
    com lista de colunas explicita e uma tupla por linha).
    """
    meta = subprocess.run(
        ['docker', 'exec', CONTAINER_DB, 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-F', '\t', '-c',
         "select column_name, data_type from information_schema.columns "
         "where table_schema='public' and table_name='trees' order by ordinal_position"],
        capture_output=True, text=True, check=True,
    ).stdout.strip().split('\n')
    colunas = [linha.split('\t') for linha in meta]

    lista = ', '.join('"%s"' % nome for nome, _ in colunas)

    # O proprio Postgres monta os literais — evita reimplementar quoting/escape aqui.
    # Numeros e booleanos ficam sem aspas, como no dump original.
    expressao = ', '.join(
        "coalesce(%s::text, 'NULL')" % nome
        if tipo in ('integer', 'numeric', 'smallint', 'boolean', 'double precision', 'bigint')
        else 'quote_nullable(%s)' % nome
        for nome, tipo in colunas
    )
    linhas = subprocess.run(
        ['docker', 'exec', CONTAINER_DB, 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-c',
         "select '\t(' || concat_ws(', ', %s) || ')' from public.trees order by id" % expressao],
        capture_output=True, text=True, check=True,
    ).stdout.rstrip('\n').split('\n')

    valores = ',\n'.join(linhas)
    seed = Path(RAIZ / 'supabase' / 'seed.sql').read_text(encoding='utf-8')
    inicio = seed.index('INSERT INTO "public"."trees"')
    fim = seed.index(';\n', inicio)
    novo = 'INSERT INTO "public"."trees" (%s) VALUES\n%s' % (lista, valores)
    Path(RAIZ / 'supabase' / 'seed.sql').write_text(
        seed[:inicio] + novo + seed[fim:], encoding='utf-8')
    print('seed.sql regenerado: %d linhas, %d colunas' % (len(linhas), len(colunas)))


if __name__ == '__main__':
    modo = sys.argv[1] if len(sys.argv) > 1 else 'mapear'
    if modo == 'mapear':
        mapear()
    elif modo == 'sql':
        gerar_sql()
    elif modo == 'seed':
        regerar_seed()
    else:
        sys.exit('modo invalido: use "mapear", "sql" ou "seed"')
