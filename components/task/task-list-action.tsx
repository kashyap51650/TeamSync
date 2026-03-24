"use client";
import { MoreHorizontal, Pen, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { deleteTaskAction } from "@/actions/task";
import { KANBAN_COLUMNS } from "@/lib/constant";
import { cn, TASK_STATUS_CONFIG } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { EditTaskDialog } from "./edit-task-dialog";
import { useState } from "react";
import { Task, TeamMemberDropdownItem } from "@/types";
import type { TaskStatus } from "@/types";

export const TaskListAction = ({
  task,
  members,
  onStatusChange,
}: {
  task: Task;
  members?: TeamMemberDropdownItem[];
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}) => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    await deleteTaskAction(task.id, id);
    setDeleteOpen(false);
    router.refresh();
  };
  return (
    <>
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
              disabled={s === task.status}
              onClick={() => {
                onStatusChange?.(task.id, s);
              }}
            >
              <span className={cn("mr-2 h-2 w-2 rounded-full", TASK_STATUS_CONFIG[s].color)} />
              {TASK_STATUS_CONFIG[s].label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-primary" onClick={() => setEditOpen(true)}>
            <Pen className="mr-2 h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {members && (
        <EditTaskDialog
          task={task}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          members={members}
        />
      )}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete Task?"
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      >
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-900">{task.title}</p>
            <p className="text-xs text-red-700 mt-1">This task will be permanently deleted</p>
          </div>

          {task.description && (
            <div className="bg-muted rounded-lg p-3 space-y-2">
              {task.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Description</p>
                  <p className="text-sm text-foreground line-clamp-2">{task.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ConfirmDialog>
    </>
  );
};
