# Sistema de Recomendação de Árvores — Lógica de Classificação

> Documento de referência para discussões com orientador e futuras manutenções.
> Baseado na planilha: `src/assets/Aplicativo - draft - oficial.xlsx` (aba "questionário organizado").
> Última atualização: 2026-03-22

---

## Visão Geral

O sistema opera em **duas fases sequenciais**:

1. **Fase eliminatória** — descarta espécies fisicamente incompatíveis ou ecologicamente inadequadas
2. **Fase classificatória** — pontua e ranqueia as espécies restantes de 0 a 100%

---

## Estrutura do Questionário

O formulário possui **6 grupos** e **2 tipos de critério**:

| Grupo | Tema                    | Tipo            | Perguntas |
|-------|-------------------------|-----------------|-----------|
| 1     | Espaço e Interferências | Eliminatório    | q1_1 … q1_8d |
| 2     | Condições Ecológicas    | Eliminatório + Classificatório | q2_1 … q2_4 |
| 3     | Preferências do Usuário | Eliminatório + Classificatório | q3_1 … q3_4 |
| 4     | Contexto e Objetivos    | Classificatório | q4_1, q4_2 |
| 5     | Preferências Botânicas  | Classificatório | q5_1, q5_2 |
| 6     | Outros Fatores          | Classificatório | q6_1, q6_2 |

> **Grupos 2 e 3** atuam como eliminatórios **e** classificatórios: primeiro descartam espécies inadequadas, depois pontuam as sobreviventes pela grau de adequação.

---

## Fase 1 — Critérios Eliminatórios

Se a árvore não atende **qualquer** regra abaixo, ela é **descartada completamente**.

### Grupo 1 — Espaço físico

| Pergunta | Condição | Espécies eliminadas |
|---|---|---|
| q1_2 — Faixa de serviço | Largura disponível | `faixa_serv_min > disponível` |
| q1_3 + q1_1 — Faixa acessível NBR 9050 | Exige 1,20m | `faixa_serv_min > (calçada − 1,20m)` |
| q1_4 — Berço/cova | Área disponível | `berco_area_min > disponível` |
| q1_5 + q1_6 — Fiação convencional a < 4m | Sim | `compat_fiacao = 'N'` |
| q1_5 + q1_6 — Fiação protegida ou ≥ 4m | Sim | `compat_fiacao = 'N'` **e** porte Grande |
| q1_7 — Recuo da edificação | Sem recuo ou < 2m | `copa_classe = 'Grande'` |
| q1_8a — Distância até esquina | < 6m | `porte_altura_classe = 'Grande'` |
| q1_8b — Distância até poste | < 4m | `copa_classe = 'Grande'` |
| q1_8c — Distância até guia rebaixada | < 1,5m | **Todas as espécies** (NBR 9050) |
| q1_8d — Distância até boca-de-lobo | < 1,5m | `potencial_dano_calcada_1a5 ≥ 4` |

### Grupo 2 — Condições ecológicas

| Pergunta | Condição | Espécies eliminadas |
|---|---|---|
| q2_1 — Insolação sol pleno | Local com sol pleno | `tolerancia_sol_pleno = false` |
| q2_1 — Insolação meia sombra | Local com meia sombra | `tolerancia_meia_sombra = false` |
| q2_1 — Insolação sombra | Local com sombra | `tolerancia_sombra = false` |
| q2_2 — Solo seco | Solo bem drenado | `tolerancia_seca_1a5 ≤ 2` |
| q2_2 — Solo encharcado | Solo alagável | `tolerancia_encharcamento_1a5 ≤ 3` |
| q2_3 — Solo ruim | Solo compactado/aterro | `tolerancia_compactacao_solo_1a5 ≤ 3` |
| q2_4 — Sem irrigação | Sem rega no 1º ano | `tolerancia_seca_1a5 ≤ 2` |

### Grupo 3 — Preferências do usuário

| Pergunta | Condição | Espécies eliminadas |
|---|---|---|
| q3_1 — Sujeira | Quer minimizar resíduos | `potencial_sujeira_1a5 ≥ 3` |
| q3_2 — Espinhos/irritantes | Quer evitar | `presenca_espinhos = true` **ou** `presenca_subst_irritantes = true` |
| q3_3 — Insetos/abelhas | Quer evitar | `atracao_fauna_1a5 ≥ 4` |

### Interpretação de faixas de medida

O sistema usa o **limite superior** da faixa (abordagem conservadora):

| Valor respondido | Limite usado |
|---|---|
| Menos de 1m | 1,0 m |
| 1 a 2m | 2,0 m |
| 2 a 3m | 3,0 m |
| 3 a 4m | 4,0 m |
| Mais de 4m | 99 m (sem restrição) |

---

## Fase 2 — Pontuação Classificatória

**MAX_SCORE = 190 pontos**

Score final: `round(soma_bruta / 190 × 100)` → percentual 0–100%.

### Grupo 2 — Condições ecológicas

#### Q2.1 — Insolação (máx 20 pts)
| Condição | Campo consultado | Pontuação |
|---|---|---|
| Sol pleno | `tolerancia_sol_pleno` | `true` → 20 / `false` → 0 / `null` → 10 |
| Meia sombra | `tolerancia_meia_sombra` | `true` → 20 / `false` → 0 / `null` → 10 |
| Sombra | `tolerancia_sombra` | `true` → 20 / `false` → 0 / `null` → 10 |

#### Q2.2 — Umidade do solo (máx 20 pts)
| Condição | Lógica |
|---|---|
| Solo seco | `tolerancia_seca_1a5 × 4` |
| Solo úmido | 15 pts fixos |
| Solo encharcado | `tolerancia_encharcamento_1a5 × 4` |

#### Q2.3 — Qualidade do solo (máx 20 pts)
| Condição | Lógica |
|---|---|
| Solo bom | 20 pts fixos |
| Solo ruim | `tolerancia_compactacao_solo_1a5 × 4` |

#### Q2.4 — Irrigação (máx 10 pts)
| Condição | Lógica |
|---|---|
| Com irrigação | 10 pts fixos |
| Sem irrigação | `tolerancia_seca_1a5 × 2` |

---

### Grupo 3 — Preferências do usuário

#### Q3.1 — Queda de resíduos (máx 15 pts)
| Condição | Lógica |
|---|---|
| Sem restrição | 15 pts fixos |
| Quer minimizar | `(6 − potencial_sujeira_1a5) × 3` |

#### Q3.2 — Espinhos/irritantes (máx 15 pts)
| Condição | Pontuação |
|---|---|
| Sem restrição | 15 pts fixos |
| Quer evitar — sem espinhos **e** sem irritantes | 15 pts |
| Quer evitar — só um dos dois ausente | 7 pts |
| Quer evitar — tem ambos | 0 pts |

#### Q3.3 — Atração de insetos (máx 10 pts)
| Condição | Lógica |
|---|---|
| Sem restrição | 10 pts fixos |
| Quer minimizar | `(6 − atracao_fauna_1a5) × 2` |

#### Q3.4 — Poda profissional (máx 10 pts)
| Condição | Lógica |
|---|---|
| Com poda | 10 pts fixos |
| Sem poda | `tolerancia_poda_1a5 × 2` |

---

### Grupo 4 — Contexto e Objetivos

#### Q4.1 — Tipo de local (máx 10 pts)
| Local | Campo | Lógica |
|---|---|---|
| Calçada | `potencial_dano_calcada_1a5` | `(6 − dano) × 2` |
| Canteiro central | `tolerancia_poluicao_atmosferica_1a5` | `poluicao × 2` |
| Praça/parque | `atracao_fauna_1a5` | `fauna × 2` |
| Rotatória | `tolerancia_ventos_fortes_1a5` | `ventos × 2` |

#### Q4.2 — Objetivo principal (máx 20 pts, **multi-seleção até 2**)

Os 20 pontos são divididos igualmente entre os objetivos selecionados (`quota = 20 / n_objetivos`).

| Objetivo | Campo | Lógica por quota |
|---|---|---|
| Sombra | `potencial_sombra_1a5` | `(valor / 5) × quota` |
| Embelezamento | `atracao_fauna_1a5` *(proxy)* | `(valor / 5) × quota` |
| Atração de fauna | `atracao_fauna_1a5` | `(valor / 5) × quota` |
| Baixa manutenção | `decidua_perenifolia`, `potencial_sujeira_1a5` | Perenifólia → quota inteiro; outros → `((6 − sujeira) / 5) × quota` |
| Qualidade do ar | `contribuicao_biodiversidade_1a5` | `(valor / 5) × quota` |
| Espécies nativas | `origem` | `'Nativa BR'` → quota / Exótica → 0 |

---

### Grupo 5 — Preferências Botânicas

#### Q5.1 — Preferência por nativas (máx 10 pts)
| Condição | Lógica |
|---|---|
| Sim | `origem = 'Nativa BR'` → 10 / Exótica → 0 |
| Não | 10 pts fixos |

#### Q5.2 — Preferência por fauna (máx 10 pts)
| Condição | Lógica |
|---|---|
| Sim | `atracao_fauna_1a5 × 2` |
| Não | 10 pts fixos |

---

### Grupo 6 — Outros Fatores

#### Q6.1 — Ventos fortes (máx 10 pts)
| Condição | Lógica |
|---|---|
| Sim | `tolerancia_ventos_fortes_1a5 × 2` |
| Não | 10 pts fixos |

#### Q6.2 — Ilha de calor (máx 10 pts)
| Condição | Lógica |
|---|---|
| Sim | `potencial_sombra_1a5 × 2` |
| Não | 10 pts fixos |

---

## Resumo dos pesos por critério

| Critério | Máx (pts) | % do total (190) |
|---|---|---|
| Insolação (q2.1) | 20 | 10,5% |
| Umidade do solo (q2.2) | 20 | 10,5% |
| Qualidade do solo (q2.3) | 20 | 10,5% |
| Queda de resíduos (q3.1) | 15 | 7,9% |
| Espinhos/irritantes (q3.2) | 15 | 7,9% |
| Objetivo(s) de plantio (q4.2) | 20 | 10,5% |
| Irrigação (q2.4) | 10 | 5,3% |
| Atração de insetos (q3.3) | 10 | 5,3% |
| Tolerância a poda (q3.4) | 10 | 5,3% |
| Tipo de local (q4.1) | 10 | 5,3% |
| Nativas (q5.1) | 10 | 5,3% |
| Fauna (q5.2) | 10 | 5,3% |
| Ventos (q6.1) | 10 | 5,3% |
| Ilha de calor (q6.2) | 10 | 5,3% |
| **Total** | **190** | **100%** |

---

## Campos do banco usados

| Campo | Tipo | Usado em |
|---|---|---|
| `faixa_serv_min_m_recomendada` | `number` | Eliminatório q1_2, q1_3 |
| `berco_area_min_m2_recomendada` | `number` | Eliminatório q1_4 |
| `compat_fiacao` | `'N'`/`'A'`/`'C'` | Eliminatório q1_5, q1_6 |
| `porte_altura_classe` | Grande/Médio/Pequeno | Eliminatório q1_5, q1_8a |
| `copa_classe` | Grande/Média/Pequena | Eliminatório q1_7, q1_8b |
| `potencial_dano_calcada_1a5` | `1–5` | Eliminatório q1_8d / Classificatório q4_1 |
| `tolerancia_sol_pleno` | `boolean` | Eliminatório + Classificatório q2_1 |
| `tolerancia_meia_sombra` | `boolean` | Eliminatório + Classificatório q2_1 |
| `tolerancia_sombra` | `boolean` | Eliminatório + Classificatório q2_1 |
| `tolerancia_seca_1a5` | `1–5` | Eliminatório q2_2, q2_4 / Classificatório q2_2, q2_4 |
| `tolerancia_encharcamento_1a5` | `1–5` | Eliminatório + Classificatório q2_2 |
| `tolerancia_compactacao_solo_1a5` | `1–5` | Eliminatório + Classificatório q2_3 |
| `tolerancia_poluicao_atmosferica_1a5` | `1–5` | Classificatório q4_1 |
| `tolerancia_ventos_fortes_1a5` | `1–5` | Classificatório q4_1, q6_1 |
| `potencial_sujeira_1a5` | `1–5` | Eliminatório + Classificatório q3_1 |
| `presenca_espinhos` | `boolean` | Eliminatório + Classificatório q3_2 |
| `presenca_subst_irritantes` | `boolean` | Eliminatório + Classificatório q3_2 |
| `atracao_fauna_1a5` | `1–5` | Eliminatório q3_3 / Classificatório q3_3, q4_1, q4_2, q5_2 |
| `tolerancia_poda_1a5` | `1–5` | Classificatório q3_4 |
| `potencial_sombra_1a5` | `1–5` | Classificatório q4_2, q6_2 |
| `contribuicao_biodiversidade_1a5` | `1–5` | Classificatório q4_2 |
| `decidua_perenifolia` | enum | Classificatório q4_2 |
| `origem` | `'Nativa BR'`/`'Exótica'` | Classificatório q4_2, q5_1 |

---

## Fluxo completo

```
Todas as espécies do banco
         ↓
 [Fase 1 — Filtro eliminatório]
 G1: Espaço físico (q1_1 a q1_8d)
 G2: Ecologia (insolação, solo, irrigação)
 G3: Preferências (sujeira, espinhos, insetos)
         ↓
 Espécies sobreviventes
         ↓
 [Fase 2 — Pontuação 0–100% / MAX=190]
 G2+G3: adequação ecológica e preferências
 G4: contexto e objetivos
 G5: preferências botânicas
 G6: ventos e ilha de calor
         ↓
 Lista ranqueada com score + breakdown por critério
```

---

## Pontos de atenção e decisões de projeto

- **Limite superior nas faixas:** usa o teto da faixa — abordagem conservadora, admite menos espécies com maior segurança de que caberão no espaço.
- **Dado `null` nas tolerâncias booleanas:** tratado como neutro (metade dos pontos).
- **Dado `null` nas escalas 1–5:** assume valor 3 (mediano).
- **Duplo uso de `tolerancia_seca`:** q2.2 (solo seco) + q2.4 (sem irrigação) → contribui até 30 pts juntos (20 + 10), aumentando peso para locais áridos sem irrigação.
- **Q3.2 é eliminatório:** qualquer presença de espinhos **ou** substâncias irritantes descarta a espécie quando o usuário quer evitar.
- **Q4.2 multi-select:** 2 objetivos dividem os 20 pontos igualmente (quota = 10 cada). Com 1 objetivo, vale os 20 inteiros.
- **"Embelezamento" usa `atracao_fauna_1a5` como proxy:** campo de odor das flores não está no banco atual. Pode ser melhorado com dados futuros.
- **Score mínimo para exibição:** atualmente sem limiar — todas as sobreviventes são exibidas mesmo com score baixo. Pode ser útil definir mínimo (ex.: ≥ 20%).
- **Com apenas 4 espécies no banco:** combinações de critérios eliminatórios agressivos podem resultar em 0 recomendações. Isso melhora naturalmente com o crescimento do catálogo.
