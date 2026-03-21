import { useMutation } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Answers, RecommendationResult } from '../types/recommendation';

export function useRecommendation() {
  return useMutation({
    mutationFn: async (answers: Answers): Promise<RecommendationResult> => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase não está configurado');
      }

      const { data, error } = await supabase.functions.invoke('recommend-trees', {
        body: { answers },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao buscar recomendações');
      }

      return data as RecommendationResult;
    },
  });
}
