// UI
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import { Calendar, GripVertical, MoreHorizontal, Trash2 } from "lucide-react";

import { KANBAN_COLUMNS } from "@/lib/constant";
import {
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  cn,
  formatDate,
  getInitials,
  isDueSoon,
  isOverdue,
} from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

export function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: Readonly<{
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
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
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100 cursor-grab" />

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {KANBAN_COLUMNS.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => onStatusChange(task.id, s)}
                    className={cn(task.status === s && "font-medium")}
                  >
                    <span
                      className={cn(
                        "mr-2 h-2 w-2 rounded-full",
                        TASK_STATUS_CONFIG[s].color,
                      )}
                    />
                    {TASK_STATUS_CONFIG[s].label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "text-sm cursor-default",
                      priorityConfig.color,
                    )}
                  >
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
              <span className="text-[11px] text-muted-foreground">
                {task.assignedTo.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
