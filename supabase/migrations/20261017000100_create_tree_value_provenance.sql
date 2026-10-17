-- Cria public.tree_value_provenance: proveniência por valor do catálogo de árvores.
--
-- Fonte: pedido do orientador de 17/10/2026. A tabela receberá os 447 registros da
-- aba "Projeções e fontes" (DAP e altura aos 10, 20 e 30 anos) e as notas das 25
-- novas espécies da aba "Parametrização 25" (1.025 linhas), cada um vinculado ao ID
-- da espécie e ao nome exato da coluna em public.trees (`campo`), com valor
-- registrado, unidade, faixa operacional, origem, confiança, método, fonte e
-- observações. `min_operacional`/`max_operacional` são bandas operacionais de
-- incerteza, não intervalos de confiança.
--
-- Escopo: apenas o esquema (tabela, CHECKs, RLS e trigger). A carga de dados fica em
-- supabase/snippets/, executada à mão em produção. Não altera linhas de public.trees.
--
-- Trigger trees_mark_provenance_changed: quando o valor de um campo com proveniência
-- muda em public.trees (edição pelo painel admin), grava valor_alterado_em = now() na
-- linha do campo, para que a ficha deixe de apresentar a fonte antiga como válida
-- para o valor novo. O campo é lido dinamicamente via jsonb (to_jsonb(OLD) -> campo),
-- sem citar colunas por nome: o banco local ainda não tem as colunas de 20 e 30 anos
-- e um campo ausente do jsonb vale NULL nos dois lados, logo nunca é marcado. A
-- comparação em jsonb (e não em texto) faz 12 sobre 12.0 contar como o mesmo valor.
--
-- Idempotente: CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE FUNCTION, e DROP
-- POLICY/TRIGGER IF EXISTS antes de recriar.
--
-- Reversão (a proveniência carregada é perdida):
--   DROP TRIGGER IF EXISTS trees_mark_provenance_changed ON public.trees;
--   DROP FUNCTION IF EXISTS public.trees_mark_provenance_changed();
--   DROP TABLE IF EXISTS public.tree_value_provenance;

CREATE TABLE IF NOT EXISTS public.tree_value_provenance (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tree_id           integer NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  campo             text NOT NULL,
  variavel          text,
  idade_anos        smallint,
  valor_registrado  text,
  unidade           text,
  min_operacional   numeric,
  max_operacional   numeric,
  origem            text NOT NULL,
  confianca         text,
  metodo            text,
  fonte             text,
  status_dominio    text,
  observacao        text,
  aba_origem        text NOT NULL,
  chave_canonica    text,
  importado_em      timestamptz NOT NULL DEFAULT now(),
  valor_alterado_em timestamptz,
  CONSTRAINT tree_value_provenance_tree_campo_key UNIQUE (tree_id, campo),
  CONSTRAINT tree_value_provenance_origem_check CHECK (origem IN (
    'published_table',
    'published_equation',
    'published_description',
    'estimated',
    'estimated_rubric',
    'estimated_taxon_proxy',
    'retido_da_fase_anterior',
    'consolidado_de_registro_inativo',
    'sem_dado_admissivel'
  )),
  CONSTRAINT tree_value_provenance_variavel_check CHECK (variavel IN ('dap', 'altura')),
  CONSTRAINT tree_value_provenance_idade_anos_check CHECK (idade_anos IN (10, 20, 30)),
  CONSTRAINT tree_value_provenance_variavel_idade_check CHECK ((variavel IS NULL) = (idade_anos IS NULL))
);

COMMENT ON TABLE public.tree_value_provenance IS
  'Proveniência por valor do catálogo: de onde vem cada atributo de public.trees (origem, confiança, método, fonte). Uma linha por (árvore, campo).';
COMMENT ON COLUMN public.tree_value_provenance.campo IS
  'Nome exato da coluna em public.trees (ex.: dap_10a_cm, compat_fiacao).';
COMMENT ON COLUMN public.tree_value_provenance.variavel IS
  'Variável projetada (dap ou altura); NULL para atributos que não são projeção por idade.';
COMMENT ON COLUMN public.tree_value_provenance.idade_anos IS
  'Idade da projeção (10, 20 ou 30); NULL exatamente quando variavel é NULL.';
COMMENT ON COLUMN public.tree_value_provenance.valor_registrado IS
  'Valor da planilha de origem, como texto, no momento da carga.';
COMMENT ON COLUMN public.tree_value_provenance.min_operacional IS
  'Limite inferior da banda operacional de incerteza; não é intervalo de confiança estatístico.';
COMMENT ON COLUMN public.tree_value_provenance.max_operacional IS
  'Limite superior da banda operacional de incerteza; não é intervalo de confiança estatístico.';
COMMENT ON COLUMN public.tree_value_provenance.origem IS
  'Chave da origem do valor (published_table, published_equation, published_description, estimated, estimated_rubric, estimated_taxon_proxy, retido_da_fase_anterior, consolidado_de_registro_inativo, sem_dado_admissivel).';
COMMENT ON COLUMN public.tree_value_provenance.aba_origem IS
  'Aba da planilha de onde o registro foi importado.';
COMMENT ON COLUMN public.tree_value_provenance.chave_canonica IS
  'Chave canônica do registro na planilha de origem.';
COMMENT ON COLUMN public.tree_value_provenance.importado_em IS
  'Momento da importação do registro.';
COMMENT ON COLUMN public.tree_value_provenance.valor_alterado_em IS
  'Preenchido pelo trigger trees_mark_provenance_changed quando o valor do campo em public.trees mudou depois do registro da fonte; NULL se o valor segue o registrado.';

ALTER TABLE public.tree_value_provenance ENABLE ROW LEVEL SECURITY;

-- Mesmas expressões das policies de public.trees (baseline): leitura pública de
-- árvore ativa; admin lê tudo; só admin escreve.
DROP POLICY IF EXISTS "Public read tree provenance" ON public.tree_value_provenance;
CREATE POLICY "Public read tree provenance" ON public.tree_value_provenance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trees t
      WHERE t.id = tree_value_provenance.tree_id AND t.ativa = true
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin insert tree provenance" ON public.tree_value_provenance;
CREATE POLICY "Admin insert tree provenance" ON public.tree_value_provenance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin update tree provenance" ON public.tree_value_provenance;
CREATE POLICY "Admin update tree provenance" ON public.tree_value_provenance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin delete tree provenance" ON public.tree_value_provenance;
CREATE POLICY "Admin delete tree provenance" ON public.tree_value_provenance
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION public.trees_mark_provenance_changed() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  old_json jsonb := to_jsonb(OLD);
  new_json jsonb := to_jsonb(NEW);
BEGIN
  UPDATE public.tree_value_provenance p
     SET valor_alterado_em = now()
   WHERE p.tree_id = NEW.id
     AND (old_json -> p.campo) IS DISTINCT FROM (new_json -> p.campo);
  RETURN NULL;
END;
$$;

ALTER FUNCTION public.trees_mark_provenance_changed() OWNER TO postgres;

DROP TRIGGER IF EXISTS trees_mark_provenance_changed ON public.trees;
CREATE TRIGGER trees_mark_provenance_changed
  AFTER UPDATE ON public.trees
  FOR EACH ROW
  WHEN (OLD IS DISTINCT FROM NEW)
  EXECUTE FUNCTION public.trees_mark_provenance_changed();
