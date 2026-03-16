import { STATUS_ICONS } from "@/lib/constant";
import { cn, TASK_STATUS_CONFIG } from "@/lib/utils";
import { Task, TaskStatus } from "@/types";
import {
  IconOnlyTaskCreateButton,
  InlineTaskCreateButton,
} from "./task/add-task-buttons";
import { TaskCard } from "./task/task-card";
export function KanbanColumn({
  projectId,
  status,
  tasks,
  members,
}: Readonly<{
  projectId: string;
  status: TaskStatus;
  tasks: Task[];
  members: { id: string; name: string }[];
}>) {
  const config = TASK_STATUS_CONFIG[status];
  const StatusIcon = STATUS_ICONS[status];

  return (
    <div className="flex flex-col rounded-xl bg-muted/30 border border-border/50">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn("h-3.5 w-3.5", config.textColor)} />
          <span className="text-xs font-semibold text-foreground/80">
            {config.label}
          </span>
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <IconOnlyTaskCreateButton
          projectId={projectId}
          members={members}
          createForStatus={status}
        />
      </div>

      <div className={cn("mx-2 mb-2 h-0.5 rounded-full", config.color)} />

      {/* Tasks */}
      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 pt-1"
        // style={{ maxHeight: "calc(100vh - 340px)" }}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <InlineTaskCreateButton
            projectId={projectId}
            createForStatus={status}
            members={members}
          />
        )}
      </div>
    </div>
  );
}
