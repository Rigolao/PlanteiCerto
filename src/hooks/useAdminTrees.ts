import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Arvore } from '../types/tree';

type TreeInput = Omit<Arvore, 'id'>;

export function useCreateTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tree: TreeInput) => {
      const { data, error } = await supabase
        .from('trees')
        .insert(tree)
        .select()
        .single();

      if (error) throw error;
      return data as Arvore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      toast.success('Árvore cadastrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar árvore: ${error.message}`);
    },
  });
}

export function useUpdateTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tree }: Partial<Arvore> & { id: number }) => {
      const { data, error } = await supabase
        .from('trees')
        .update(tree)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Arvore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      toast.success('Árvore atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar árvore: ${error.message}`);
    },
  });
}

export function useDeleteTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('trees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      toast.success('Árvore excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir árvore: ${error.message}`);
    },
  });
}

export function useTreeUsageCount(treeId: number | null) {
  const { data: count = 0, isLoading } = useQuery({
    queryKey: ['tree-usage', treeId],
    queryFn: async () => {
      if (!treeId) return 0;
      const { count, error } = await supabase
        .from('points')
        .select('*', { count: 'exact', head: true })
        .eq('tree_id', treeId);
      if (error) return 0;
      return count ?? 0;
    },
    enabled: treeId !== null,
    staleTime: 30 * 1000, // 30 segundos
  });

  return { count, isLoading };
}

export function useUploadTreeImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tree-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('tree-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    },
    onError: (error: Error) => {
      toast.error(`Erro ao fazer upload da imagem: ${error.message}`);
    },
  });
}
