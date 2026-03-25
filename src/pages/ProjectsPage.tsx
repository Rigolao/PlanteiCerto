import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTrees } from '../hooks/useTrees';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectEditor } from '../components/projects/ProjectEditor';
import { ProjectRowSkeleton } from '../components/ui/Skeleton';
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
        <div className="mb-6">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-2" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProjectRowSkeleton key={i} />
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
