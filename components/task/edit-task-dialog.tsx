"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { updateTaskAction } from "@/actions/task";
import { KANBAN_COLUMNS } from "@/lib/constant";
import {
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  cn,
  getInitials,
} from "@/lib/utils";
import { UpdateTaskForm, updateTaskSchema } from "@/schema/task-schema";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  TeamMemberDropdownItem,
} from "@/types";
import { useTransition } from "react";
import { toast } from "sonner";

export function EditTaskDialog({
  open,
  onClose,
  task,
  members,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  task: Task;
  members: TeamMemberDropdownItem[];
}>) {
  const [isPending, setTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateTaskForm>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      assignedToId: task.assignedToId ?? undefined,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : undefined,
    },
  });

  const onSubmit = (data: UpdateTaskForm) => {
    setTransition(async () => {
      try {
        await updateTaskAction(task.id, data);
        onClose();
      } catch (error) {
        console.error("Error updating task", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update task",
        );
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        reset();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Add more context..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                defaultValue={task.status}
                onValueChange={(v: TaskStatus) => setValue("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KANBAN_COLUMNS.map((s) => (
                    <SelectItem key={s} value={s}>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            TASK_STATUS_CONFIG[s].color,
                          )}
                        />
                        {TASK_STATUS_CONFIG[s].label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                defaultValue={task.priority}
                onValueChange={(v: TaskPriority) => setValue("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.icon} {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                defaultValue={task.assignedToId ?? "none"}
                onValueChange={(v) =>
                  setValue("assignedToId", v === "none" ? undefined : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px]">
                            {getInitials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        {m.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
