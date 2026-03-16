import { Card, CardContent } from "@/components/ui/card";
import { KANBAN_COLUMNS } from "@/lib/constant";
import { cn, TASK_STATUS_CONFIG } from "@/lib/utils";
import { fetchTasksByProject } from "@/services/projects";
import { Task, TaskStatus } from "@/types";
import { TaskListRow } from "../task/task-list-raw";

export const ProjectTasksTab = async ({ projectId }: { projectId: string }) => {
  const tasks = await fetchTasksByProject(projectId);
  const tasksByStatus = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );
  return (
    <Card className="py-0">
      <div className="flex items-center gap-3 border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className="w-3" />
        <span className="flex-1">Task</span>
        <span className="w-4">Pri</span>
        <span className="w-5">User</span>
        <span className="w-16 text-right">Due</span>
        <span className="w-6" />
      </div>
      <CardContent className="p-1">
        {KANBAN_COLUMNS.map((status) => {
          const col = tasksByStatus[status];
          if (col.length === 0) return null;
          return (
            <div key={status}>
              <div className="flex items-center gap-2 px-3 py-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    TASK_STATUS_CONFIG[status].color,
                  )}
                />
                <span className="font-semibold text-muted-foreground">
                  {TASK_STATUS_CONFIG[status].label} · {col.length}
                </span>
              </div>
              <hr className="mx-2 mb-2 h-0.5 rounded-full border-0 bg-border" />
              {col.map((task) => (
                <TaskListRow key={task.id} task={task} />
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
