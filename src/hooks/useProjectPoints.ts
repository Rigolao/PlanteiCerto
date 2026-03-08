import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import type { Ponto } from '../types/project';

export function useProjectPoints(projectId: string | null) {
  const [points, setPoints] = useState<Ponto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPoints = useCallback(async () => {
    if (!projectId) {
      setPoints([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('points')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    if (!error && data) {
      setPoints(data);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const addPoint = async (treeId: number, lat: number, lng: number, observacao: string) => {
    if (!projectId) return null;

    const { data, error } = await supabase
      .from('points')
      .insert({
        project_id: projectId,
        tree_id: treeId,
        lat,
        lng,
        observacao,
      })
      .select()
      .single();

    if (!error && data) {
      setPoints(prev => [...prev, data]);
      toast.success('Árvore adicionada com sucesso!');
      return data as Ponto;
    }
    toast.error('Erro ao adicionar a árvore no projeto.');
    return null;
  };

  const removePoint = async (pointId: string) => {
    const { error } = await supabase.from('points').delete().eq('id', pointId);
    if (!error) {
      setPoints(prev => prev.filter(p => p.id !== pointId));
      toast.success('Árvore removida do mapa.');
    } else {
      toast.error('Erro ao remover a árvore do mapa.');
    }
    return !error;
  };

  const updatePoint = async (pointId: string, treeId: number, observacao: string) => {
    const { data, error } = await supabase
      .from('points')
      .update({ tree_id: treeId, observacao })
      .eq('id', pointId)
      .select()
      .single();

    if (!error && data) {
      setPoints(prev => prev.map(p => (p.id === pointId ? data : p)));
      toast.success('Dados da árvore atualizados!');
      return data as Ponto;
    }
    toast.error('Erro ao atualizar os dados da árvore.');
    return null;
  };

  return { points, loading, addPoint, removePoint, updatePoint, refetch: fetchPoints };
}
