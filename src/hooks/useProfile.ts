import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Profile } from '../types/auth';

export function useProfile() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error.message);
        return null;
      }

      return data as Profile;
    },
    enabled: !!user && isSupabaseConfigured(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    profile,
    isAdmin: profile?.role === 'admin',
    loading: isLoading,
  };
}
