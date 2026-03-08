import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Projeto } from '../types/project';

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*, points(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Projeto[];
    },
    enabled: !!user,
  });

  const createProjectMutation = useMutation({
    mutationFn: async ({ nome, descricao }: { nome: string; descricao: string }) => {
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          nome,
          descricao,
          centro_lat: -21.1767,
          centro_lng: -47.8208,
          centro_zoom: 14,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Projeto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast.success('Projeto criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar o projeto.');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast.success('Projeto removido com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover o projeto.');
    },
  });

  const updateMapCenterMutation = useMutation({
    mutationFn: async ({ projectId, lat, lng, zoom }: { projectId: string; lat: number; lng: number; zoom: number }) => {
      const { error } = await supabase
        .from('projects')
        .update({ centro_lat: lat, centro_lng: lng, centro_zoom: zoom })
        .eq('id', projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  return {
    projects,
    loading,
    createProject: async (nome: string, descricao: string) => {
      try {
        return await createProjectMutation.mutateAsync({ nome, descricao });
      } catch {
        return null;
      }
    },
    deleteProject: async (projectId: string) => {
      try {
        return await deleteProjectMutation.mutateAsync(projectId);
      } catch {
        return false;
      }
    },
    updateMapCenter: async (projectId: string, lat: number, lng: number, zoom: number) => {
      try {
        await updateMapCenterMutation.mutateAsync({ projectId, lat, lng, zoom });
      } catch {
        // ignore
      }
    },
    refetch,
  };
}
