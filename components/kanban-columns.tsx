"use client";

import { useDroppable } from "@dnd-kit/core";
import { STATUS_ICONS } from "@/lib/constant";
import { cn, TASK_STATUS_CONFIG } from "@/lib/utils";
import { Task, TaskStatus } from "@/types";
import { IconOnlyTaskCreateButton, InlineTaskCreateButton } from "./task/add-task-buttons";
import { DraggableTaskCard } from "./task/draggable-task-card";

export function KanbanColumn({
  projectId,
  status,
  tasks,
  members,
  onStatusChange,
}: Readonly<{
  projectId: string;
  status: TaskStatus;
  tasks: Task[];
  members: { id: string; name: string }[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}>) {
  const config = TASK_STATUS_CONFIG[status];
  const StatusIcon = STATUS_ICONS[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col rounded-xl bg-muted/30 border border-border/50">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn("h-3.5 w-3.5", config.textColor)} />
          <span className="text-xs font-semibold text-foreground/80">{config.label}</span>
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
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto p-2 pt-1 rounded-b-xl transition-colors",
          isOver && "bg-primary/5 ring-1 ring-inset ring-primary/20",
        )}
      >
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
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
