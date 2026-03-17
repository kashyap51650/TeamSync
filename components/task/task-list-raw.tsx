import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuthUser } from "@/lib/auth";
import {
  cn,
  formatDate,
  getInitials,
  isOverdue,
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
} from "@/lib/utils";
import { Task } from "@/types";
import { TaskListAction } from "./task-list-action";
// import { fetchTeamMembers } from "@/services/user";
import { fetchMembersByProject } from "@/services/projects";

export async function TaskListRow({
  task,
}: Readonly<{
  task: Task;
}>) {
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const overdue = isOverdue(task.dueDate);

  // const user = await getAuthUser();
  const members = (await fetchMembersByProject(task.projectId)).map((user) => {
    return {
      id: user.user.id,
      name: user.user.name,
    };
  });

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
      {/* Status dot */}
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", statusConfig.color)}
      ></span>

      {/* Title */}
      <span
        className={cn(
          "flex-1 min-w-0 text-sm truncate",
          task.status === "DONE" && "line-through text-muted-foreground",
        )}
      >
        {task.title}
      </span>

      {/* Priority */}
      <span
        className={cn("text-sm shrink-0", priorityConfig.color)}
        title={priorityConfig.label}
      >
        {priorityConfig.icon} {priorityConfig.label}
      </span>

      {/* Assignee */}
      {task.assignedTo ? (
        <div className="flex gap-2">
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarImage src={task.assignedTo.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[9px]">
              {getInitials(task.assignedTo.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-muted-foreground">
            {task.assignedTo.name}
          </span>
        </div>
      ) : (
        <div className="h-5 w-5 shrink-0 rounded-full border border-dashed border-muted-foreground/30" />
      )}

      {/* Due date */}
      <span
        className={cn(
          "shrink-0 text-[11px]",
          overdue ? "text-red-500 font-medium" : "text-muted-foreground",
        )}
      >
        {task.dueDate ? formatDate(task.dueDate, "MMM d") : "—"}
      </span>

      {/* Actions */}
      {<TaskListAction task={task} members={members} />}
    </div>
  );
}
