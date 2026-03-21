import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';
import type { Profile } from '../types/auth';

export function useAdminUsers() {
  const { data: users = [], isLoading } = useQuery<Profile[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        toast.error(`Erro ao carregar usuários: ${error.message}`);
        return [];
      }

      return data as Profile[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return { users, loading: isLoading };
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'admin' | 'user' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(role === 'admin' ? 'Usuário promovido a administrador!' : 'Privilégios de admin removidos.');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao alterar permissão: ${error.message}`);
    },
  });
}
