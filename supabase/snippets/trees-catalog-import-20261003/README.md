# Carga do catálogo arbóreo — 2026-10-03

Este diretório guarda os SQLs usados para atualizar o catálogo de árvores do PlanteiCerto, junto com o relatório de conferência. Os scripts 01–06 foram executados manualmente em produção, conforme confirmação do autor. O SELECT exportado em 2026-10-03 confirmou 192 registros e correspondência exata dos 63 campos operacionais para os 152 IDs alvo. O SELECT posterior confirmou os oito campos complementares nos destinos, preservando os valores que já existiam.

**Não mova estes arquivos para `supabase/migrations`.** Os SQLs 01–06 já foram executados em produção e não devem ser reaplicados às cegas. Se os scripts 01–05 forem usados em outro banco, confira o esquema, os IDs e as FKs com o SQL 01; não execute se o estado inicial divergir.

## Ordem para uma execução em outro ambiente

1. `01-preflight-arvores-supabase.sql` — leitura do esquema, FKs, contagens e IDs propostos.
2. `02-atualizar-arvores-supabase.sql` — upsert dos 152 registros usando os 51 campos da aba `Carga app 51`.
3. `03-projecoes-20-30-arvores-supabase.sql` — adiciona as 12 colunas numeric de 20/30 anos e carrega os valores.
4. `04-migrar-e-desativar-arvores-supabase.sql` — migra referências e inativa os 17 registros com destino definido. Preserva os IDs 41, 113 e 152 ativos.
5. `05-posflight-arvores-supabase.sql` — consultas de validação somente leitura após a carga e migração.
6. `06-complementar-fichas-arvores.sql` — preserva valores do destino e preenche apenas os vazios nos pares 82→11, 97→19 e 120→79. Após executá-lo, rode novamente as consultas de validação do SQL 05.

Execute os scripts em sessões separadas no SQL Editor. A ordem acima descreve a operação original e não significa que ela precise ser repetida em produção.

A carga grava os campos operacionais e as 12 medidas numéricas de projeção; metadados de origem/confiança e anotações de auditoria da planilha não fazem parte do esquema carregado. Consulte [`comparacao-arvores.md`](./comparacao-arvores.md) para escopo, comparação linha a linha e ressalvas.

## Regra de consolidação de fichas

Regra definida pelo autor: ao consolidar uma ficha antiga no destino, preservar qualquer valor já preenchido no destino; copiar da origem apenas os campos em que o destino esteja NULL/vazio. Os SQLs desta pasta registram a operação já executada e o SQL 04 apenas migra referências e inativa as origens; ele não mescla atributos.

Na conferência do SELECT atual, o par 108→8 não tem campos complementares a copiar; os valores preenchidos divergem e devem manter os do ID 8. Para outros pares há oito valores candidatos a preencher no destino: 82→11 (três campos), 97→19 (três) e 120→79 (dois). O SELECT posterior enviado pelo autor mostra os oito atributos preenchidos nos destinos conforme a regra. O autor confirmou que executou o SQL 06; o arquivo fica registrado aqui como histórico da atualização aplicada. Confere os três pares, preserva qualquer valor preenchido no destino, copia apenas NULL/vazio e aborta se origem ou status dos pares divergir do esperado.
