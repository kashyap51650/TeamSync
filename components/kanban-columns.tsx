"use client";

import { deleteTaskAction, updateTaskAction } from "@/actions/task";
import { STATUS_ICONS } from "@/lib/constant";
import { cn, TASK_STATUS_CONFIG } from "@/lib/utils";
import { Task, TaskStatus } from "@/types";
import { Plus } from "lucide-react";
import { TaskCard } from "./task/task-card";
import { Button } from "./ui/button";

export function KanbanColumn({
  status,
  tasks,
}: Readonly<{
  status: TaskStatus;
  tasks: Task[];
}>) {
  const config = TASK_STATUS_CONFIG[status];
  const StatusIcon = STATUS_ICONS[status];

  return (
    <div className="flex min-w-[260px] max-w-[260px] flex-col rounded-xl bg-muted/30 border border-border/50">
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
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          // onClick={() => onAddTask(status)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className={cn("mx-2 mb-2 h-0.5 rounded-full", config.color)} />

      {/* Tasks */}
      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 pt-1"
        style={{ maxHeight: "calc(100vh - 340px)" }}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={(id, status) => updateTaskAction(id, { status })}
            onDelete={deleteTaskAction}
          />
        ))}

        {tasks.length === 0 && (
          <button
            // onClick={() => onAddTask(status)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary/70"
          >
            <Plus className="h-3.5 w-3.5" /> Add task
          </button>
        )}
      </div>
    </div>
  );
}
