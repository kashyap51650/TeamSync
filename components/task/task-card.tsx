// UI
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Icons
import { Calendar, GripVertical } from "lucide-react";
import type { useDraggable } from "@dnd-kit/core";

type DragListeners = ReturnType<typeof useDraggable>["listeners"];

import {
  TASK_PRIORITY_CONFIG,
  cn,
  formatDate,
  getInitials,
  isDueSoon,
  isOverdue,
} from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";
import { TaskListAction } from "./task-list-action";

export function TaskCard({
  task,
  dragHandleListeners,
  onStatusChange,
}: Readonly<{
  task: Task;
  dragHandleListeners?: DragListeners;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}>) {
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate);
  const dueSoon = !overdue && isDueSoon(task.dueDate);

  const getDueDateBadgeClass = () => {
    if (overdue) {
      return "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400";
    }
    if (dueSoon) {
      return "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400";
    }
    return "bg-muted text-muted-foreground";
  };

  const dueDateBadgeClass = getDueDateBadgeClass();

  return (
    <div className="group rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-150 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Drag to reorder"
          className="mt-0.5 h-5 w-5 shrink-0 cursor-grab touch-none opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
          {...(dragHandleListeners ?? {})}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/40" />
        </Button>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-start justify-between gap-1">
            <p
              className={cn(
                "text-sm font-medium leading-snug line-clamp-2",
                task.status === "DONE" && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </p>
            <TaskListAction task={task} onStatusChange={onStatusChange} />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn("text-sm cursor-default", priorityConfig.color)}>
                    {priorityConfig.icon}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{priorityConfig.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-1.5 py-0.5",
                  dueDateBadgeClass,
                )}
              >
                <Calendar className="h-2.5 w-2.5" />
                {formatDate(task.dueDate, "MMM d")}
                {overdue && " · late"}
              </span>
            )}
          </div>

          {/* Assignee */}
          {task.assignedTo && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <Avatar className="h-4 w-4">
                <AvatarImage src={task.assignedTo.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                  {getInitials(task.assignedTo.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-muted-foreground">{task.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
