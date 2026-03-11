import { ProjectCard } from "@/components/projects/project-card";
import { ProjectHeader } from "@/components/projects/project-header";
import { getAuthUser } from "@/lib/auth";
import { fetchProjects } from "@/services/projects";
import { FolderKanban } from "lucide-react";

export default async function ProjectsPage() {
  const user = await getAuthUser();
  const projects = await fetchProjects(user?.sub);

  const renderContent = () => {
    // if (isLoading) {
    //   return (
    //     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    //       {new Array(6).map((_, i) => (
    //         <Skeleton key={i / 10} className="h-48 rounded-xl" />
    //       ))}
    //     </div>
    //   );
    // }

    if (projects?.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <FolderKanban className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold">No projects yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to get started
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ProjectHeader projectLength={projects?.length || 0} />
      {renderContent()}
    </div>
  );
}
