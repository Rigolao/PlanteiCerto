# Carga da proveniência por valor — 2026-10-17

Este diretório guarda a carga de `public.tree_value_provenance`, a tabela criada pela migration `supabase/migrations/20261017000100_create_tree_value_provenance.sql`. São 1.480 registros que dizem de onde vem cada valor do catálogo: origem, confiança, método, fonte, ressalvas e, nas projeções, a faixa operacional.

| Fonte | Registros | Conteúdo |
|---|---:|---|
| Aba "Projeções e fontes" | 447 | DAP e altura aos 10, 20 e 30 anos dos 152 IDs ativos |
| Aba "Parametrização 25" | 1.025 | 41 campos × 25 espécies novas (IDs 199–223) |
| SQL 06 de 03/10/2026 | 8 | campos copiados de registros inativados: 82→11 (3), 97→19 (3), 120→79 (2) |

A planilha é `Plantei_Certo_Carga_152_Homologacao_Condicional.xlsx`. A carga não altera `public.trees`. As lacunas (`sem_dado_admissivel`) só são registradas como "não avaliado" e continuam NULL na tabela de árvores.

**Não mova estes arquivos para `supabase/migrations`.** No `db reset` local as migrations rodam antes do `seed.sql`, e os inserts com FK para `trees` falhariam. Esquema em migration; dados em snippet executado à mão, como na carga de 03/10.

## Ordem em produção

Execute cada passo em uma sessão separada do SQL Editor:

1. `supabase/migrations/20261017000100_create_tree_value_provenance.sql`: tabela, CHECKs, RLS e trigger.
2. `01-importar-proveniencia.sql`: carga dentro de `BEGIN … COMMIT`. Aborta sem gravar nada em quatro casos:
   - a tabela já tem linhas destas abas (trava de reexecução);
   - valor, mínimo ou máximo de alguma das 447 projeções difere de `public.trees` (comparação numérica exata);
   - `public.trees` não tem 192 árvores e 152 ativas, ou algum dos 152 IDs da carga está inativo;
   - a contagem inserida por aba difere do esperado.
3. `02-posflight.sql`: somente leitura. Mostra as contagens e termina com o aviso `Pós-carga da proveniência: OK` ou com um erro que diz o que divergiu.

Reversão: `DELETE FROM public.tree_value_provenance WHERE aba_origem IN ('Projeções e fontes', 'Parametrização 25', 'SQL 06 (03/10/2026)');`

## Números esperados

| Conferência | Esperado |
|---|---:|
| Total | 1.480 |
| Por aba: Projeções e fontes / Parametrização 25 / SQL 06 (03/10/2026) | 447 / 1.025 / 8 |
| Projeções dap 10a / 20a / 30a | 152 / 42 / 42 |
| Projeções altura 10a / 20a / 30a | 152 / 32 / 27 |
| `estimated` (331 projeções + 38 parametrização) | 369 |
| `published_table` | 65 |
| `published_equation` | 51 |
| `published_description` | 74 |
| `estimated_rubric` (11 notas 1–5 × 25 espécies) | 275 |
| `estimated_taxon_proxy` | 6 |
| `retido_da_fase_anterior` | 144 |
| `consolidado_de_registro_inativo` | 8 |
| `sem_dado_admissivel`, todos NULL em `public.trees` | 488 |
| Projeções divergentes de `public.trees` | 0 |
| `public.trees`: total / ativas / inativas | 192 / 152 / 40 |

Na aba "Parametrização 25", as confianças `não_avaliada` (488) e `conforme_fase_anterior` (144) são gravadas como NULL, porque a origem já diz isso. `min_operacional`/`max_operacional` são bandas operacionais de incerteza, não intervalos de confiança.

A coluna `status_carga` da planilha marca 150 linhas com "ID PROPOSTO — não importar sem cadastro". Os 25 IDs (199–223) já estão cadastrados e ativos em produção, então essa ressalva não bloqueia a carga. A coluna não é importada.

## Regenerar o `01`

O `01-importar-proveniencia.sql` é gerado; não o edite à mão.

```bash
python3 -E scripts/gerar_sql_proveniencia.py \
  --planilha ~/Downloads/Plantei_Certo_Carga_152_Homologacao_Condicional.xlsx \
  --export "<CSV exportado de SELECT * FROM trees em produção>" \
  --saida supabase/snippets/provenance-import-20261017/01-importar-proveniencia.sql
```

Use `-E`, e não `-I`, porque o `openpyxl` está no site do usuário. A exportação deve ter as 63 colunas, com NULL escrito como `null`. Antes de gravar o arquivo, o gerador confere:

- as contagens (447, 1.025 e 8) e se nenhuma chave `(tree_id, campo)` se repete;
- se todo ID existe na exportação e está ativo, e se o nome científico confere;
- se valor, mínimo e máximo das projeções e valor da parametrização batem com a exportação (números com tolerância de 1e-6; texto e booleano por igualdade normalizada);
- se toda linha `sem_dado_admissivel` está NULL na exportação;
- se os 8 consolidados estão preenchidos no destino e são iguais ao registro inativo de origem;
- se as origens estão entre as 9 chaves da tabela.

Qualquer divergência ou formato inesperado sai com exit 1, lista os problemas e não grava nada. Quando tudo confere, a última linha é:

```
projecoes=447 parametrizacao=1025 consolidacao=8 divergencias=0
```

A exportação de 17/10 (11:04) tem 155 árvores ativas porque foi feita antes da inativação de 41, 113 e 152. Isso é esperado: o gerador não exige 152 ativas; quem confere isso no banco é a trava do `01`.

## Teste local, sem alterar o banco

```bash
bash scripts/testar_carga_proveniencia_local.sh "<CSV exportado de SELECT * FROM trees>"
```

O script usa o container `supabase_db_PlanteiCerto` e roda tudo dentro de `BEGIN … ROLLBACK`. Não use `supabase db reset`. O prelúdio aplica a migration da proveniência e cria as 12 colunas de 20/30 anos que o banco local não tem. Depois faz `TRUNCATE public.trees CASCADE` e `\copy` do CSV de produção, e aplica `20261017000000_inativar_casos_especiais_trees.sql`, que deixa 152 ativas. Em seguida, duas execuções:

- A: prelúdio → `01` (sem as linhas `BEGIN;`/`COMMIT;`) → `02` → `ROLLBACK`. Precisa sair com 0 e mostrar `Pós-carga da proveniência: OK`.
- B: prelúdio → `01` → `01` de novo → `ROLLBACK`. Precisa falhar com a mensagem `Carga de proveniência já aplicada: … já contém 1480 linha(s)`.

O script sai com 0 só se A passar, B falhar pela trava de reexecução e o banco local terminar igual ao início. A comparação usa as contagens de `trees`, `points` e `user_favorites` e confere que não existe `tree_value_provenance`. No fim, ele remove `/tmp/trees_export.csv` do container.

## Aviso: snippet de 03/10

A migration da proveniência cria uma FK nova, `tree_value_provenance.tree_id → trees(id)`. O `04-migrar-e-desativar-arvores-supabase.sql` da pasta `trees-catalog-import-20261003` aborta se houver qualquer FK para `public.trees` além de `points` e `user_favorites` ("Há FKs para public.trees além de points/user_favorites. Migre-as antes de desativar."). Por isso, se ele for reexecutado depois desta carga, vai parar nessa trava. Não o reexecute sem adaptar a trava e sem decidir o que fazer com a proveniência dos IDs desativados.
