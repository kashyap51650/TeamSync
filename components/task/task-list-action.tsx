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
import { deleteTaskAction, updateTaskAction } from "@/actions/task";
import { KANBAN_COLUMNS } from "@/lib/constant";
import { cn, TASK_STATUS_CONFIG } from "@/lib/utils";
import { useParams } from "next/navigation";
import { EditTaskDialog } from "./edit-task-dialog";
import { useState } from "react";
import { Task, TeamMemberDropdownItem } from "@/types";

export const TaskListAction = ({
  task,
  members,
}: {
  task: Task;
  members?: TeamMemberDropdownItem[];
}) => {
  const { id } = useParams<{ id: string }>();
  const [editOpen, setEditOpen] = useState(false);
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
              onClick={() => updateTaskAction(task.id, { status: s })}
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
            className="text-primary"
            onClick={() => setEditOpen(true)}
          >
            <Pen className="mr-2 h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => deleteTaskAction(task.id, id)}
          >
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
    </>
  );
};
