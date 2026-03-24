import { fetchTasksByProject } from "@/services/task";
import { fetchUsers } from "@/services/user";
import { KanbanBoard } from "./kanban-board";

export const KanbanBoardTab = async ({ projectId }: { projectId: string }) => {
  const [users, tasks] = await Promise.all([fetchUsers(), fetchTasksByProject(projectId)]);

  return <KanbanBoard projectId={projectId} initialTasks={tasks} users={users} />;
};
