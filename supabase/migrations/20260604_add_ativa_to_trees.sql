-- Migration: Add column 'ativa' to public.trees and update RLS policies
-- Date: 2026-06-04

-- 1. Add column 'ativa' with default value 'true'
ALTER TABLE public.trees ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true;

-- 2. Drop existing public read policy
DROP POLICY IF EXISTS "Public read trees" ON public.trees;

-- 3. Create updated public read policy that filters out inactive trees for non-admin users
CREATE POLICY "Public read trees" ON public.trees
  FOR SELECT
  USING (
    ativa = true
    OR (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );
