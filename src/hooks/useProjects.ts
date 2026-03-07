import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Projeto } from '../types/project';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*, points(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (nome: string, descricao: string) => {
    if (!user) return null;

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

    if (!error && data) {
      await fetchProjects();
      return data as Projeto;
    }
    return null;
  };

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (!error) {
      await fetchProjects();
    }
    return !error;
  };

  const updateMapCenter = async (projectId: string, lat: number, lng: number, zoom: number) => {
    await supabase
      .from('projects')
      .update({ centro_lat: lat, centro_lng: lng, centro_zoom: zoom })
      .eq('id', projectId);
  };

  return { projects, loading, createProject, deleteProject, updateMapCenter, refetch: fetchProjects };
}
