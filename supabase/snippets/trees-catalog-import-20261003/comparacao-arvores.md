# Auditoria completa da homologação das árvores

## Escopo e evidência

Foram lidas as 18 abas do arquivo `Plantei_Certo_Carga_152_Homologacao_Condicional.xlsx`, conferidos os arquivos SQL 02–05 desta pasta e comparados com o SELECT atual de produção enviado em `Supabase Snippet Untitled query 220.csv`. A planilha é tratada como fonte de dados e de ressalvas; instruções nela são gates/recomendações do autor da planilha, não autorização para executar ações no banco. Nenhuma conexão ao Supabase foi feita nesta auditoria.

## As 18 abas revisadas

| Aba | Conteúdo e instrução/ressalva relevante |
|---|---|
| `Resumo` | Consolida proposta 152, origem dos valores, lacunas e status de homologação; diz expressamente que não houve exportação para app e que produção não estava conferida. |
| `Ativas 152 - campos` | Proposta integral por árvore: 152 registros, 80 colunas (2 de controle, 51 do app, 12 projeções numéricas, 12 metadados de origem/confiança e 3 textos de auditoria). Não é igual ao pacote de importação 51 campos. |
| `Projeções e fontes` | 447 registros com valores, fonte, origem, confiança, método e estado de domínio; essa trilha não está persistida pelos SQLs 02/03. |
| `Substituições 10a` | 19 valores published substituem estimativas antigas; exige recálculo de métricas dependentes. |
| `Remover ou inativar` | 40 casos: 17 migrar referências e inativar, 20 já inativos, 3 casos especiais. |
| `Lacunas e decisões` | Declara fase anterior: 144 preenchimentos rastreáveis + 881 lacunas; instrução de não tratar projeções antigas como estimativas das espécies novas e de persistir proveniência. |
| `Auditoria final` | 9 conflitos interpretativos; orienta preservar valores published e registrar ressalvas, não suavizar valores. |
| `Recálculo serviços 10a` | 17 árvores, 68 métricas derivadas; equação Chave e linha de base DAP 3 cm fora da calibração explicitamente ressalvadas. |
| `Lacunas 25 novas` | Matriz final de 1025 células: 537 preenchidas/propostas e 488 sem valor admissível. 393 registros de preenchimento desta rodada + 72 publicados/interpretados + 72 estimados = 537. |
| `Evidências botânicas` | Fontes botânicas e dimensões naturais; alerta para não confundir porte natural com teto operacional urbano. |
| `Biomassa novas 10a` | 24 novas espécies com estimativa de biomassa; ID 221 excluído por DAP abaixo da calibração; densidades repetidas não significam incerteza zero. |
| `Contrato 41 campos` | Histórico v4, explicitamente superado por Parametrização 25; define nulabilidade, prioridade funcional A/B/C e condição de liberação. |
| `Parametrização 25` | Fonte vigente para 1025 células; 537 propostas documentadas, ressalvadas como inferências/valores botânicos, não importação definitiva sem validação. |
| `Carga app 51` | Tabela de importação concreta para 152 IDs; inclui ativa=true nas 25 novas e campos vazios como NULL. |
| `Projeções 20-30` | Tabela com os 152 IDs e 12 medidas de DAP/altura; os SQLs carregam numerais, mas não a proveniência/confiança. |
| `Plano inativação` | Tabela com 40 registros: 17 migrações, 20 já inativos e 3 casos especiais; nome e destino por ID. |
| `Contrato observado 51` | Snapshot do tipo/nulabilidade do pacote v1, não verificação do esquema atual; assinala risco de faixa textual em campo de primeira bifurcação. |
| `Gate de implantação` | Gate mais recente: carga condicional; 133 lacunas prioritárias, 25 imagens sem licença/URL, ressalvas taxonômicas e instrução de não executar produção automaticamente. |

## Como os SQLs se comparam à proposta

- **SQL 02** contém 152 registros da aba `Carga app 51`, correspondendo ao conjunto proposto de 152 IDs para upsert: os 127 IDs existentes são atualizados e 25 novos (199–223) são inseridos. Ele grava somente as 51 colunas do contrato do app; as 12 medidas de 20/30 anos e os metadados de origem/confiança não estão nesse script.
- **SQL 03** contém 152 registros da aba `Projeções 20-30`; cria e preenche as 12 colunas numéricas. Os valores em branco viram NULL, como a planilha exige. A aba `Projeções e fontes` e os 12 metadados de origem/confiança não são persistidos.
- **SQL 04** cobre exatamente os 17 pares de migração da aba de inativação, atualiza referências em `points` e `user_favorites` e inativa os IDs de origem. Não trata como exclusão definitiva os casos 41, 113 e 152.
- **SQL 05** é um pós-voo de totais, tipos de coluna, cobertura das projeções, estados dos 17 IDs, referências e casos especiais. Os resultados enviados cobrem essas verificações.
- Conferência campo a campo dos arquivos gerados contra o Excel: SQL 02 = **7.752 valores** (152 × 51) sem divergência; SQL 03 = **2.128 valores** (152 × ID, nome e 12 medidas) sem divergência. Isso comprova alinhamento SQL↔planilha, não SQL↔banco após execução.
- A carga executada não implementou todas as abas como tabelas de auditoria. Permaneceram fora do banco as fontes/métodos/confianças por campo, notas explicativas, ressalvas botânicas, conflitos e a trilha de evidência. Isso coincide com “camada separada” em parte, mas contraria a recomendação de persistir proveniência por valor se esse era requisito de produto.

## Resultado por comparação com produção

| Verificação | Proposta/esperado | Resultado enviado | Leitura |
|---|---|---|---|
| Contagem | 167 anteriores + 25 novas = 192 | 192 | Confere |
| Maior ID | 199–223, máximo 223 | 223 | Confere |
| 12 colunas 20/30 | `numeric` | 12 existentes, todas `numeric` | Confere |
| Cobertura numérica | DAP20: 42; H20: 32; DAP30: 42; H30: 27 (min/máx iguais às contagens centrais) | exatamente essas contagens | Confere |
| 17 pares legados | desativar após migrar | os 17 retornaram `ativa=false` | Confere |
| Referências antigas | zero em `points` e `user_favorites` | zero e zero | Confere nas duas tabelas verificadas |
| Casos especiais | fora do SQL automático; rever separadamente | 41, 113 e 152 continuam ativos | Execução conforme sua decisão atual; difere da proposta de 152 |
| Ativos finais | 152 na planilha se os 3 especiais saírem da lista ativa | 155 | São os 152 propostos + 3 casos mantidos ativos |
| Biomassa 10a ID 221 | NULL conforme ressalva de calibração | sem biomassa/carbono/CO₂e 10a; projeções 20/30 comparadas normalmente | Confere com a planilha |
| IDs únicos | 192 registros | nenhum ID repetido no SELECT | Confere |

Os agregados não demonstram que cada valor de cada árvore no Supabase é idêntico ao Excel. Para isso seria necessária uma exportação atual de `public.trees` após a carga. Os scripts 02 e 03 foram construídos a partir das abas de carga, e os resultados que você enviou confirmam estrutura, contagens e exceções, mas não cada campo.

## Pendência de recomendação: lacunas que não são só 20/30 anos

A afirmação “o que falta é em grande maioria 20/30 anos” não é verdadeira para as 25 novas árvores na planilha. As projeções 20/30 são uma camada à parte; além delas, a matriz das 25 novas registra **488 de 1.025 campos sem valor admissível**, incluindo **133 células prioritárias A** distribuídas em filtros de porte/implantação/compatibilidade. A planilha orienta que recomendações dependentes desses filtros não sejam liberadas sem lógica explícita para desconhecido. Ainda assim, `ativa=true` é uma coluna distinta: manter a árvore ativa não significa que cada fluxo de recomendação trate NULL com segurança. A carga deixou as 25 novas ativas, como consta na aba e no SQL 02.

Outros gates não resolvidos pela carga: 25 imagens sem licença/URL; ID 221 com biomassa nula pela calibração; ressalvas taxonômicas para 203/207; valores 20/30 que excedem tetos adultos operacionais em 201/215; e nove conflitos antigos na aba de auditoria. Isso não invalida automaticamente os valores carregados, mas deve permanecer visível para publicação e recomendação.

## Diferença nos totais de lacunas (resolvida)

A aba antiga `Lacunas e decisões` usa o retrato de uma fase anterior: 144 preenchimentos rastreáveis e 881 células pendentes. Nas abas finais, 144 anteriores + 393 preenchimentos desta rodada = 537 preenchidas; 1.025 − 537 = 488 sem valor admissível. Portanto 881 é um contador histórico, não o total final atual. A `Auditoria final` e o `Gate de implantação` ainda repetem parte da contagem 881 em contexto antigo; para o estado final, prevalecem `Lacunas 25 novas`, `Parametrização 25` e Gate linha 8 com 537/488.

## Duplicatas citadas na conversa

A planilha define 17 correspondências canônicas que foram executadas. O caso de duas “Açoita-cavalo” é explícito: o ID 108 (`Luehea divaricata`) foi migrado para o ID 8, mesmo táxon, e ficou inativo; o ID 217 (`Luehea grandiflora`) é outra espécie e permanece como árvore distinta. Em outras duplicações, um registro pode conter campos que faltam no destino; a planilha/SQL migra referências, mas não combina automaticamente atributos. A auditoria anterior encontrou possíveis campos complementares nos pares 82→11, 97→19 e 120→79; eles não foram mesclados pelo SQL 04. Se quiser consolidar atributos, isso exige decisão por campo e validação taxonômica, não basta marcar uma linha inativa.

## O que está feito e o que falta para encerrar

- Feito segundo as saídas enviadas: 25 IDs inseridos, IDs até 223, totais 192/155, 12 colunas numéricas, distribuição de nulos das projeções conforme a planilha, 17 duplicatas inativadas e nenhuma referência antiga nas duas tabelas consultadas.
- Confirmado campo a campo: os 63 campos operacionais da carga em todos os 152 IDs. O SELECT não contém as 12 colunas de origem/confiança da planilha, pois esses metadados não fazem parte das 63 colunas do esquema carregado. O SELECT sozinho também não mostra FKs em outras tabelas; o SQL 04 contém uma trava para abortar se houver FK adicional, e as saídas de produção já enviadas cobriram referências em `points` e `user_favorites`. Permanecem decisões de produto sobre NULL nos filtros de recomendação e revisão dos gates de imagem, taxonomia e biomassa.
- Estado de decisão: 41, 113 e 152 permanecem ativos porque você decidiu mantê-los; por isso o número atual esperado é 155 ativos, não 152.

## Arquivos SQL existentes e ordem executada

1. `01-preflight-arvores-supabase.sql` — somente leitura.
2. `02-atualizar-arvores-supabase.sql` — carga de 51 campos.
3. `03-projecoes-20-30-arvores-supabase.sql` — 12 números aos 20/30 anos.
4. `04-migrar-e-desativar-arvores-supabase.sql` — 17 migrações/desativações.
5. `05-posflight-arvores-supabase.sql` — validação pós-carga; resultados fornecidos pelo usuário.

## Inventário de contagens conferidas

- Abas: 18.
- Linhas da carga: 152; IDs novos: 25; aba de projeções: 152.
- SQL 02 tuples: 152; SQL 03 tuples: 152.
- Matriz final lacunas: 1025 linhas; estados: preenchido na parametrização v5=393, resolvido — estimated=72, resolvido — publicado/interpretado=72, sem dado admissível=488.


## Confirmação com o SELECT atual

O arquivo `Supabase Snippet Untitled query 220.csv` contém **192 linhas, 63 colunas e nenhum ID repetido**. As colunas correspondem exatamente a 51 campos da aba `Carga app 51` + 12 projeções numéricas da aba `Projeções 20-30`. Para os 152 IDs propostos, foram comparados 9.576 valores (nulos, booleanos, números e textos) com **zero divergências**. Os outros 40 registros são os IDs que não pertencem à proposta ativa, incluindo os 17 desativados e os três casos especiais.

As 12 contagens de preenchimento das projeções também batem integralmente: DAP20=42, altura20=32, DAP30=42 e altura30=27, com as respectivas colunas mínimas/máximas repetindo as mesmas contagens. O total no SELECT é 192, com 155 ativas e maior ID 223; 41, 113 e 152 são exatamente os três ativos fora da lista de 152. Os 17 IDs mapeados estão inativos.

A planilha tem mais 12 colunas de proveniência/confiança que não aparecem no SELECT. Elas não são discrepâncias nos dados carregados: ficaram fora do esquema SQL de produção conforme os scripts executados.
