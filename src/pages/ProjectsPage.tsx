import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTrees } from '../hooks/useTrees';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectEditor } from '../components/projects/ProjectEditor';
import { ProjectCardSkeleton } from '../components/ui/Skeleton';
import type { Projeto } from '../types/project';

export function ProjectsPage() {
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject, updateMapCenter } = useProjects();
  const { trees } = useTrees();
  const [openProject, setOpenProject] = useState<Projeto | null>(null);

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

  if (projectsLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-40 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
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
      onEditProject={updateProject}
      onDeleteProject={deleteProject}
    />
  );
}
