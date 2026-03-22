import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoriteIds = new Set<number>(), isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user || !isSupabaseConfigured()) return new Set<number>();

      const { data, error } = await supabase
        .from('user_favorites')
        .select('tree_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return new Set(data.map((f: { tree_id: number }) => f.tree_id));
    },
    enabled: !!user && isSupabaseConfigured(),
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const toggleMutation = useMutation({
    mutationFn: async (treeId: number) => {
      if (!user) throw new Error('Usuário não logado');

      const isFav = favoriteIds.has(treeId);

      if (isFav) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('tree_id', treeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, tree_id: treeId });
        if (error) throw error;
      }

      return { treeId, added: !isFav };
    },
    onMutate: async (treeId: number) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
      const previous = queryClient.getQueryData<Set<number>>(['favorites', user?.id]);

      queryClient.setQueryData<Set<number>>(['favorites', user?.id], (old) => {
        const next = new Set(old);
        if (next.has(treeId)) {
          next.delete(treeId);
        } else {
          next.add(treeId);
        }
        return next;
      });

      return { previous };
    },
    onError: (_err, _treeId, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['favorites', user?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  return {
    favoriteIds,
    loading: isLoading,
    toggleFavorite: toggleMutation.mutate,
    isFavorite: (id: number) => favoriteIds.has(id),
  };
}
