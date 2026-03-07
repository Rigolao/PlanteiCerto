import { useState, useEffect, useCallback } from 'react';
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
      return data as Ponto;
    }
    return null;
  };

  const removePoint = async (pointId: string) => {
    const { error } = await supabase.from('points').delete().eq('id', pointId);
    if (!error) {
      setPoints(prev => prev.filter(p => p.id !== pointId));
    }
    return !error;
  };

  return { points, loading, addPoint, removePoint, refetch: fetchPoints };
}
