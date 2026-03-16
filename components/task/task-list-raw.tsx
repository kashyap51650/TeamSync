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
import { KANBAN_COLUMNS } from "@/lib/constant";
import {
  cn,
  formatDate,
  getInitials,
  isOverdue,
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
} from "@/lib/utils";
import { Task, TaskStatus } from "@/types";
import { MoreHorizontal, Trash2 } from "lucide-react";

export function TaskListRow({
  task,
  onStatusChange,
  onDelete,
}: Readonly<{
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}>) {
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const overdue = isOverdue(task.dueDate);

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
      {/* Status dot */}
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", statusConfig.color)}
      />

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
        {priorityConfig.icon}
      </span>

      {/* Assignee */}
      {task.assignedTo ? (
        <Avatar className="h-5 w-5 shrink-0">
          <AvatarImage src={task.assignedTo.avatarUrl ?? undefined} />
          <AvatarFallback className="text-[9px]">
            {getInitials(task.assignedTo.name)}
          </AvatarFallback>
        </Avatar>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {KANBAN_COLUMNS.map((s) => (
            <DropdownMenuItem
              key={s}
              onClick={() => onStatusChange(task.id, s)}
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
            className="text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
