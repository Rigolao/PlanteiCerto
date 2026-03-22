-- ============================================
-- TABELA: user_favorites (Favoritos do usuário)
-- ============================================
CREATE TABLE public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tree_id integer NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tree_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seus favoritos
CREATE POLICY "Users can view own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Usuário pode inserir seus próprios favoritos
CREATE POLICY "Users can add favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuário pode remover seus próprios favoritos
CREATE POLICY "Users can remove favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_tree_id ON public.user_favorites(tree_id);
