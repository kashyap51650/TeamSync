/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/use-project";
import { useCreateTask, useMyTasks, useUpdateTask } from "@/hooks/use-tasks";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Calendar, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const COLUMNS: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  projectId: z.string().uuid("Select a project"),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NO_PRIORITY"]),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]),
});

type CreateForm = z.infer<typeof createSchema>;

function TaskCard({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate);
  const dueSoon = !overdue && isDueSoon(task.dueDate);

  return (
    <div className="group rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-border/80">
      {/* Priority indicator */}
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-sm">{priorityConfig.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>

          {task.project && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: task.project.color }}
              />
              <span className="text-[11px] text-muted-foreground truncate">
                {task.project.name}
              </span>
            </div>
          )}

          {task.dueDate && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-[11px]",
                overdue ? "text-red-500" : dueSoon ? "text-amber-500" : "text-muted-foreground",
              )}
            >
              {overdue && <AlertCircle className="h-3 w-3" />}
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate, "MMM d")}</span>
              {overdue && <span className="font-medium">overdue</span>}
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between">
            {task.assignedTo ? (
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assignedTo.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[9px]">
                  {getInitials(task.assignedTo.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span />
            )}

            <Select
              value={task.status}
              onValueChange={(val: any) => onStatusChange(task.id, val as TaskStatus)}
            >
              <SelectTrigger className="h-5 w-auto border-0 bg-transparent p-0 text-[10px] shadow-none focus:ring-0 gap-1">
                <div
                  className={cn("h-1.5 w-1.5 rounded-full", TASK_STATUS_CONFIG[task.status].color)}
                />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMNS.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {TASK_STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  onStatusChange,
}: {
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const config = TASK_STATUS_CONFIG[status];

  return (
    <div className="flex min-w-[280px] flex-col rounded-xl bg-muted/30 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", config.color)} />
          <span className="text-sm font-medium">{config.label}</span>
        </div>
        <Badge variant="secondary" className="text-xs h-5 px-1.5">
          {tasks.length}
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
            <p className="text-xs text-muted-foreground">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: projects } = useProjects();
  const { mutate, isPending } = useCreateTask();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const onSubmit = (data: CreateForm) => {
    mutate(data as any, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What needs to be done?" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Project</Label>
            <Select onValueChange={(v) => setValue("projectId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-xs text-destructive">{errors.projectId.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                defaultValue="NO_PRIORITY"
                onValueChange={(v) => setValue("priority", v as any)}
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
              <Label>Status</Label>
              <Select defaultValue="TODO" onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage() {
  const { data: tasks, isLoading } = useMyTasks();
  const { mutate: updateTask } = useUpdateTask();
  const [creating, setCreating] = useState(false);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTask({ id, status });
  };

  const tasksByStatus = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = tasks?.filter((t) => t.status === status) ?? [];
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tasks?.length ?? 0} tasks assigned to you
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((s) => (
            <div key={s} className="min-w-[280px] space-y-2">
              <Skeleton className="h-8 rounded-lg" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <CreateTaskDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
