import { KANBAN_COLUMNS } from "@/lib/constant";
import { KanbanColumn } from "../kanban-columns";
import { fetchTasksByProject } from "@/services/task";
import { fetchUsers } from "@/services/user";
import { Task, TaskStatus } from "@/types";

export const KanbanBoardTab = async ({ projectId }: { projectId: string }) => {
  const users = await fetchUsers();
  const tasks = await fetchTasksByProject(projectId);

  const tasksByStatus = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  return (
    <div className="grid grid-cols-5 gap-2 pb-4">
      {KANBAN_COLUMNS.map((status) => (
        <KanbanColumn
          projectId={projectId}
          members={users}
          key={status}
          status={status}
          tasks={tasksByStatus[status]}
        />
      ))}
    </div>
  );
};
