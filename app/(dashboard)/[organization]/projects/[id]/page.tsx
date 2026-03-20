import Link from "next/link";

// UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";

// Icons
import {
  BarChart3,
  CheckSquare,
  ChevronRight,
  FolderKanban,
  Users,
} from "lucide-react";

import { KanbanBoardTab } from "@/components/projects/kanban-board-tab";
import { ProjectActionDropdown } from "@/components/projects/project-action-dropdown";
import { ProjectAnalyticsTab } from "@/components/projects/project-analytics-tab";
import { ProjectMemberCard } from "@/components/projects/project-members";
import { ProjectTasksTab } from "@/components/projects/project-tasks";
import { fetchProjectById } from "@/services/projects";
import { Suspense } from "react";
import { getAuthUser } from "@/lib/auth";
import { fetchOrganizationBySlug } from "@/services/organization";
import { fetchOrganizationTeamMembers } from "@/services/team";

export default async function ProjectPage({
  params,
}: Readonly<{
  params: Promise<{ id: string; organization: string }>;
}>) {
  const { id, organization } = await params;
  console.log("Project ID from params:", await params);
  const project = await fetchProjectById(id);
  const user = await getAuthUser();
  const currentOrg = await fetchOrganizationBySlug(organization);

  const teamMembersData = await fetchOrganizationTeamMembers(currentOrg.id);

  const teamMembers = teamMembersData.map((val) => {
    return {
      id: val.id,
      name: val.user.name,
    };
  });

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FolderKanban className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold">Project not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This project may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* ── Breadcrumb ── */}
        <div className="grid grid-cols-8">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground col-span-6">
            <Link
              href={`/${organization}/projects`}
              className="hover:text-foreground transition-colors"
            >
              Projects
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {project?.name}
            </span>
          </div>
          <div className="col-span-2 flex shrink-0 items-center justify-end gap-2">
            <ProjectActionDropdown
              userId={user?.sub}
              projectId={id}
              members={teamMembers}
              project={project}
            />
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="board" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="h-8">
              <TabsTrigger value="board" className="gap-1.5 text-xs px-3">
                <FolderKanban className="h-3.5 w-3.5" /> Board
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5 text-xs px-3">
                <CheckSquare className="h-3.5 w-3.5" /> List
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5 text-xs px-3">
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-1.5 text-xs px-3">
                <Users className="h-3.5 w-3.5" /> Members
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Board Tab ── */}
          <TabsContent value="board" className="mt-0">
            <Suspense fallback={<div>Loading board...</div>}>
              <KanbanBoardTab projectId={id} />
            </Suspense>
          </TabsContent>

          {/* ── List Tab ── */}
          <TabsContent value="list" className="mt-0">
            <ProjectTasksTab projectId={id} />
          </TabsContent>

          {/* ── Analytics Tab ── */}
          <TabsContent value="analytics" className="mt-0">
            {project?.tasks.length && (
              <ProjectAnalyticsTab tasks={project?.tasks} />
            )}
          </TabsContent>

          {/* ── Members Tab ── */}
          <TabsContent value="members" className="mt-0">
            <ProjectMemberCard projectId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
