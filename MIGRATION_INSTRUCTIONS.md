# 🚀 Instruções de Migração - Estrutura Flat de Árvore

## Status
✅ **Código finalizado** | ⏳ **Aguardando execução do SQL no banco**

A migração de código está 100% pronta. Apenas o SQL precisa ser executado no Supabase.

---

## 📋 Quick Start (Opção Recomendada)

### 1️⃣ Abra o SQL Editor do Supabase

[🔗 Clique aqui para abrir o Dashboard](https://supabase.com/dashboard/project/hlrhgcozeeqhrklhusyh)

- Menu → **SQL Editor**
- Clique **"+ New query"**

### 2️⃣ Cole este SQL:

```sql
-- Migration: Flatten tree data structure (Development Only)
-- Date: 2026-03-17
-- WARNING: This migration destroys all existing tree data and points.
-- Use ONLY in development environment!

-- Drop dependent table first
DROP TABLE IF EXISTS public.points CASCADE;

-- Drop the old nested tree table
DROP TABLE IF EXISTS public.trees CASCADE;

-- Create new flat trees table
CREATE TABLE public.trees (
  id                                  serial PRIMARY KEY,
  id_especie                          text NOT NULL UNIQUE,
  foto                                text,
  nome_cientifico                     text NOT NULL,
  nome_popular                        text NOT NULL,
  origem                              text NOT NULL CHECK (origem IN ('Nativa BR', 'Exótica')),
  decidua_perenifolia                 text CHECK (decidua_perenifolia IN ('Perenifólia', 'Decídua', 'Semidecídua')),
  epoca_floracao                      text,
  epoca_frutificacao                  text,
  altura_adulta_max_m                 numeric,
  porte_altura_classe                 text CHECK (porte_altura_classe IN ('Grande', 'Médio', 'Pequeno')),
  diametro_copa_adulto_max_m          numeric,
  copa_classe                         text CHECK (copa_classe IN ('Grande', 'Média', 'Pequena')),
  dap_adulto_max_cm                   numeric,
  altura_primeira_bifurcacao_m        text,
  forma_copa                          text,
  faixa_serv_min_m_recomendada        numeric,
  berco_area_min_m2_recomendada       numeric,
  volume_solo_min_m3_recomendado      numeric,
  compat_fiacao                       text CHECK (compat_fiacao IN ('N', 'A', 'C')),
  potencial_dano_calcada_1a5          smallint CHECK (potencial_dano_calcada_1a5 BETWEEN 1 AND 5),
  tolerancia_sol_pleno                boolean,
  tolerancia_meia_sombra              boolean,
  tolerancia_sombra                   boolean,
  tolerancia_seca_1a5                 smallint CHECK (tolerancia_seca_1a5 BETWEEN 1 AND 5),
  tolerancia_encharcamento_1a5        smallint CHECK (tolerancia_encharcamento_1a5 BETWEEN 1 AND 5),
  tolerancia_poluicao_atmosferica_1a5 smallint CHECK (tolerancia_poluicao_atmosferica_1a5 BETWEEN 1 AND 5),
  tolerancia_compactacao_solo_1a5     smallint CHECK (tolerancia_compactacao_solo_1a5 BETWEEN 1 AND 5),
  tolerancia_ventos_fortes_1a5        smallint CHECK (tolerancia_ventos_fortes_1a5 BETWEEN 1 AND 5),
  potencial_sujeira_1a5               smallint CHECK (potencial_sujeira_1a5 BETWEEN 1 AND 5),
  presenca_espinhos                   boolean
);

-- Create points table (tree plantings within projects)
CREATE TABLE public.points (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tree_id     integer REFERENCES public.trees(id) ON DELETE SET NULL,
  lat         double precision NOT NULL,
  lng         double precision NOT NULL,
  observacao  text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- Seed the 4 sample trees from xlsx
INSERT INTO public.trees (
  id, id_especie, nome_cientifico, nome_popular, origem, decidua_perenifolia,
  epoca_floracao, epoca_frutificacao, altura_adulta_max_m, porte_altura_classe,
  diametro_copa_adulto_max_m, copa_classe, dap_adulto_max_cm, altura_primeira_bifurcacao_m,
  forma_copa, faixa_serv_min_m_recomendada, berco_area_min_m2_recomendada,
  volume_solo_min_m3_recomendado, compat_fiacao, potencial_dano_calcada_1a5,
  tolerancia_sol_pleno, tolerancia_meia_sombra, tolerancia_sombra,
  tolerancia_seca_1a5, tolerancia_encharcamento_1a5, tolerancia_poluicao_atmosferica_1a5,
  tolerancia_compactacao_solo_1a5, tolerancia_ventos_fortes_1a5, potencial_sujeira_1a5,
  presenca_espinhos
)
VALUES
  (1, 'OITI_001', 'Licania tomentosa', 'Oiti', 'Nativa BR', 'Perenifólia',
   'Set-Nov', 'Dez-Mar', 15, 'Grande', 12, 'Grande', 80, '2,5 - 3,5',
   'Arredondada/Espalhada', 1.80, 2.00, 4.00, 'N', 4,
   true, true, false, 5, 2, 4, 3, 4, 4, false),

  (2, 'RESEDA_001', 'Lagerstroemia indica', 'Resedá', 'Exótica', 'Decídua',
   'Verão', NULL, 8, 'Médio', 5, 'Pequena', 30, '1,8 - 2,5',
   'Arredondada/Globosa', 0.80, 1.00, 1.50, 'A', 1,
   true, true, false, 5, 3, 4, 4, 3, 1, false),

  (3, 'PATAVACA_001', 'Bauhinia forficata', 'Pata-de-Vaca', 'Nativa BR', 'Semidecídua',
   'Ago-Nov', 'Dez-Mar', 10, 'Médio', 7, 'Média', 40, '1,8 - 2,5',
   'Arredondada/Irregular', 1.00, 1.50, 2.50, 'C', 3,
   true, true, false, 4, 2, 3, 3, 3, 3, true),

  (4, 'ESCUMILHA_001', 'Sapindus saponaria', 'Escumilha', 'Nativa BR', 'Decídua',
   'Set-Nov', 'Dez-Mar', 12, 'Médio', 8, 'Média', 50, '2,0 - 3,0',
   'Arredondada/Globosa', 1.20, 1.50, 3.00, 'C', 2,
   true, true, false, 5, 3, 4, 4, 4, 2, false);

-- Create indexes for performance
CREATE INDEX idx_trees_origem ON public.trees(origem);
CREATE INDEX idx_trees_nome_popular ON public.trees(nome_popular);
CREATE INDEX idx_points_project_id ON public.points(project_id);
CREATE INDEX idx_points_tree_id ON public.points(tree_id);
```

### 3️⃣ Clique **"Run"** ▶️

Aguarde a execução (deve levar alguns segundos).

---

## ✅ Depois da Migração

### Testar no Navegador

1. Recarregue http://localhost:5174
2. Veja os cards com dados completos:
   ```
   Oiti
   📏 Altura: 15m (Grande)
   🌍 Origem: 🇧🇷 Nativa
   🌿 Folhagem: Perenifólia
   ```

3. Clique em um card para abrir modal com 4 seções:
   - **Morfologia**: Forma, DAP, bifurcação
   - **Tolerâncias**: Sol, seca, encharcamento, poluição, etc
   - **Fenologia**: Folhagem, floração, frutificação
   - **Urbanismo**: Fiação, dano calçada, recomendações

---

## 📊 Dados Seeded

4 árvores do xlsx:
| Nome | Científico | Altura | Porte | Nativa | Espinhos |
|------|-----------|--------|-------|--------|----------|
| Oiti | Licania tomentosa | 15m | Grande | ✓ | ✗ |
| Resedá | Lagerstroemia indica | 8m | Médio | ✗ | ✗ |
| Pata-de-Vaca | Bauhinia forficata | 10m | Médio | ✓ | ✓ |
| Escumilha | Sapindus saponaria | 12m | Médio | ✓ | ✗ |

---

## 🆘 Troubleshooting

**P: Os dados ainda estão vazios após a migração?**
A: Recarregue a página (Cmd+R ou Ctrl+F5) e limpe o cache

**P: Qual é a senha do banco?**
A: Não precisa! Use o SQL Editor do Dashboard (já autenticado)

**P: Posso fazer isso via CLI?**
A: Sim, com `supabase` CLI:
```bash
npm install -g supabase
supabase link --project-ref hlrhgcozeeqhrklhusyh
supabase db push
```

---

## 📁 Arquivo Original

Salvo em: `supabase/migrations/20260317_flat_trees_schema.sql`

---

**Status**: 🟢 Código pronto | ⏳ Aguardando SQL no banco
