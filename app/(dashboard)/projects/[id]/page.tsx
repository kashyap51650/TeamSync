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

import { deleteTaskAction, updateTaskAction } from "@/actions/task";
import { KanbanColumn } from "@/components/kanban-columns";
import { ProjectActionDropdown } from "@/components/projects/project-action-dropdown";
import { ProjectAnalyticsTab } from "@/components/projects/project-analytics-tab";
import { ProjectMemberCard } from "@/components/projects/project-members";
import { KANBAN_COLUMNS } from "@/lib/constant";
import { fetchProjectById } from "@/services/projects";
import { Task, TaskStatus } from "@/types";
import { ProjectTasksTab } from "@/components/projects/project-tasks";

export default async function ProjectPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  // fake loading delay
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const project = await fetchProjectById(id);

  console.log("Fetching project :", project);

  const members = project.members.map((member) => ({
    id: member.id,
    name: member.user.name,
  }));

  const tasksByStatus = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = project.tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

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
              href="/projects"
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
              projectId={id}
              members={members}
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
            {/* {tasksLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-4"> */}
            {/* {KANBAN_COLUMNS.map((s) => (
              <div key={s} className="min-w-[260px] space-y-2">
                <Skeleton className="h-8 rounded-lg" />
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ))} */}
            {/* </div> */}
            {/* ) : ( */}
            <div className="flex gap-3 overflow-x-auto pb-4">
              {KANBAN_COLUMNS.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status]}
                />
              ))}
            </div>
            {/* )} */}
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
