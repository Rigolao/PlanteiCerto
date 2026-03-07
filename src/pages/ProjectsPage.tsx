import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useTrees } from '../hooks/useTrees';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectEditor } from '../components/projects/ProjectEditor';
import type { Projeto } from '../types/project';

export function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { projects, createProject, deleteProject, updateMapCenter } = useProjects();
  const { trees } = useTrees();
  const [openProject, setOpenProject] = useState<Projeto | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  if (!user) return null;

  if (openProject) {
    return (
      <ProjectEditor
        project={openProject}
        trees={trees}
        onBack={() => setOpenProject(null)}
        onUpdateMapCenter={updateMapCenter}
      />
    );
  }

  return (
    <ProjectList
      projects={projects}
      onOpenProject={(id) => {
        const proj = projects.find(p => p.id === id);
        if (proj) setOpenProject(proj);
      }}
      onCreateProject={createProject}
      onDeleteProject={deleteProject}
    />
  );
}
