/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/projects/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from "@/hooks/use-project";
import {
  useTasksByProject,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/use-tasks";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Recharts
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

// Icons
import {
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Settings,
  Trash2,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Calendar,
  AlertCircle,
  Circle,
  CircleDot,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  GripVertical,
  Flag,
  ChevronRight,
} from "lucide-react";

import {
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  PROJECT_STATUS_CONFIG,
  formatDate,
  formatRelative,
  getInitials,
  isOverdue,
  isDueSoon,
  cn,
} from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority, TeamMember } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const KANBAN_COLUMNS: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

const STATUS_ICONS = {
  BACKLOG: Circle,
  TODO: CircleDot,
  IN_PROGRESS: Clock,
  IN_REVIEW: AlertCircle,
  DONE: CheckCircle2,
  CANCELLED: XCircle,
};

const STATUS_PIE_COLORS: Record<string, string> = {
  BACKLOG: "#94a3b8",
  TODO: "#60a5fa",
  IN_PROGRESS: "#fbbf24",
  IN_REVIEW: "#a78bfa",
  DONE: "#34d399",
  CANCELLED: "#f87171",
};

// ─── Create Task Dialog ───────────────────────────────────────────────────────

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  priority: z
    .enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NO_PRIORITY"])
    .default("NO_PRIORITY"),
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"])
    .default("TODO"),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional(),
});
type CreateTaskForm = z.infer<typeof createTaskSchema>;

function CreateTaskDialog({
  open,
  onClose,
  projectId,
  defaultStatus,
  members,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultStatus?: TaskStatus;
  members: TeamMember[];
}) {
  const { mutate, isPending } = useCreateTask();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { status: defaultStatus ?? "TODO", priority: "NO_PRIORITY" },
  });

  const onSubmit = (data: CreateTaskForm) => {
    mutate({ ...data, projectId } as any, {
      onSuccess: () => {
        reset();
        onClose();
      },
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
          <DialogTitle>Create Task</DialogTitle>
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
                defaultValue={defaultStatus ?? "TODO"}
                onValueChange={(v) => setValue("status", v as any)}
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
                defaultValue="NO_PRIORITY"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              <Label>Assignee</Label>
              <Select
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
                    <SelectItem key={m.userId} value={m.userId}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px]">
                            {getInitials(m.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        {m.user.name}
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
              {isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate);
  const dueSoon = !overdue && isDueSoon(task.dueDate);
  const StatusIcon = STATUS_ICONS[task.status];

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
                  overdue
                    ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                    : dueSoon
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-muted text-muted-foreground",
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

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  tasks,
  onStatusChange,
  onDelete,
  onAddTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onAddTask: (status: TaskStatus) => void;
}) {
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
          onClick={() => onAddTask(status)}
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
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <button
            onClick={() => onAddTask(status)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary/70"
          >
            <Plus className="h-3.5 w-3.5" /> Add task
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Task List Row ────────────────────────────────────────────────────────────

function TaskListRow({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
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

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function ProjectAnalyticsTab({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const overdue = tasks.filter(
    (t) => isOverdue(t.dueDate) && t.status !== "DONE",
  ).length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Status breakdown for pie
  const statusMap: Record<string, number> = {};
  tasks.forEach((t) => {
    statusMap[t.status] = (statusMap[t.status] ?? 0) + 1;
  });
  const pieData = Object.entries(statusMap).map(([status, count]) => ({
    name: TASK_STATUS_CONFIG[status as TaskStatus]?.label ?? status,
    value: count,
    status,
  }));

  // Priority breakdown for bar
  const priorityOrder: TaskPriority[] = [
    "URGENT",
    "HIGH",
    "MEDIUM",
    "LOW",
    "NO_PRIORITY",
  ];
  const priorityMap: Record<string, number> = {};
  tasks.forEach((t) => {
    priorityMap[t.priority] = (priorityMap[t.priority] ?? 0) + 1;
  });
  const barData = priorityOrder
    .filter((p) => priorityMap[p] > 0)
    .map((p) => ({
      name: TASK_PRIORITY_CONFIG[p].label,
      count: priorityMap[p] ?? 0,
    }));

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Tasks", value: total, color: "text-foreground" },
          {
            label: "Completed",
            value: done,
            color: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "In Progress",
            value: tasks.filter((t) => t.status === "IN_PROGRESS").length,
            color: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Overdue",
            value: overdue,
            color:
              overdue > 0
                ? "text-red-600 dark:text-red-400"
                : "text-foreground",
          },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {label}
              </p>
              <p className={cn("mt-1 text-2xl font-bold", color)}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion progress */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Overall Completion</p>
            <span className="text-sm font-bold text-primary">
              {completionRate}%
            </span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {done} of {total} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No tasks yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_PIE_COLORS[entry.status] ?? "#94a3b8"}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 space-y-1">
              {pieData.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: STATUS_PIE_COLORS[item.status] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No tasks yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={barData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    fill="hsl(var(--primary))"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Edit Project Dialog ──────────────────────────────────────────────────────

const PROJECT_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
];

const editProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  color: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
type EditProjectForm = z.infer<typeof editProjectSchema>;

function EditProjectDialog({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: NonNullable<ReturnType<typeof useProject>["data"]>;
}) {
  const { mutate, isPending } = useUpdateProject();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProjectForm>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      status: project.status,
      color: project.color,
      startDate: project.startDate
        ? formatDate(project.startDate, "yyyy-MM-dd")
        : "",
      endDate: project.endDate ? formatDate(project.endDate, "yyyy-MM-dd") : "",
    },
  });

  const selectedColor = watch("color");

  const onSubmit = (data: EditProjectForm) => {
    mutate({ id: project.id, ...data } as any, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                defaultValue={project.status}
                onValueChange={(v) => setValue("status", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue("color", c)}
                    className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      outline: selectedColor === c ? `2px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" {...register("endDate")} />
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [creatingTask, setCreatingTask] = useState(false);
  const [createForStatus, setCreateForStatus] = useState<TaskStatus>("TODO");
  const [editingProject, setEditingProject] = useState(false);

  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: tasks = [], isLoading: tasksLoading } = useTasksByProject(id);
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: deleteProject } = useDeleteProject();

  const { data: members = [] } = useQuery({
    queryKey: ["team"],
    queryFn: () =>
      apiClient
        .get<{ data: TeamMember[] }>("/api/team")
        .then((r) => r.data ?? []),
  });

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTask({ id: taskId, status });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Delete this task?")) deleteTask(taskId);
  };

  const handleAddTask = (status: TaskStatus) => {
    setCreateForStatus(status);
    setCreatingTask(true);
  };

  const handleDeleteProject = () => {
    if (
      confirm(`Delete "${project?.name}"? This will also delete all tasks.`)
    ) {
      deleteProject(id, { onSuccess: () => router.push("/projects") });
    }
  };

  // Derived task stats
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

  const tasksByStatus = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  // Loading skeleton
  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-24 rounded-xl" />
        <div className="flex gap-3">
          {KANBAN_COLUMNS.map((s) => (
            <div key={s} className="min-w-[260px] space-y-2">
              <Skeleton className="h-8 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FolderKanban className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold">Project not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This project may have been deleted.
        </p>
        <Button asChild className="mt-4">
          <Link href="/projects">← Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const statusConfig = PROJECT_STATUS_CONFIG[project.status];

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/projects"
            className="hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {project.name}
          </span>
        </div>

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {/* Color icon */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5"
              style={{ background: project.color + "20" }}
            >
              <FolderKanban
                className="h-5 w-5"
                style={{ color: project.color }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {project.name}
                </h1>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>
              {project.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {formatRelative(project.createdAt)}
                </span>
                {project.endDate && (
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      isOverdue(project.endDate) && "text-red-500 font-medium",
                    )}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Due {formatDate(project.endDate)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {done}/{total} tasks done
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreateForStatus("TODO");
                setCreatingTask(true);
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Task
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setEditingProject(true)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDeleteProject}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Overall Progress
              </span>
              <span className="font-bold text-foreground">
                {completionPct}%
              </span>
            </div>
            <Progress value={completionPct} className="h-2" />
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-lg font-bold">{total}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {done}
              </p>
              <p className="text-[10px] text-muted-foreground">Done</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {tasks.filter((t) => t.status === "IN_PROGRESS").length}
              </p>
              <p className="text-[10px] text-muted-foreground">Active</p>
            </div>
            <div>
              <p
                className={cn(
                  "text-lg font-bold",
                  tasks.filter(
                    (t) => isOverdue(t.dueDate) && t.status !== "DONE",
                  ).length > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground",
                )}
              >
                {
                  tasks.filter(
                    (t) => isOverdue(t.dueDate) && t.status !== "DONE",
                  ).length
                }
              </p>
              <p className="text-[10px] text-muted-foreground">Overdue</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="board" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="h-8">
              <TabsTrigger value="board" className="gap-1.5 text-xs px-3">
                <FolderKanban className="h-3.5 w-3.5" /> Board
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5 text-xs px-3">
                <CheckSquare className="h-3.5 w-3.5" /> List
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5 text-xs px-3">
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-1.5 text-xs px-3">
                <Users className="h-3.5 w-3.5" /> Members
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Board Tab ── */}
          <TabsContent value="board" className="mt-0">
            {tasksLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map((s) => (
                  <div key={s} className="min-w-[260px] space-y-2">
                    <Skeleton className="h-8 rounded-lg" />
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map((status) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                    onAddTask={handleAddTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── List Tab ── */}
          <TabsContent value="list" className="mt-0">
            <Card>
              {/* List header */}
              <div className="flex items-center gap-3 border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="w-3" />
                <span className="flex-1">Task</span>
                <span className="w-4">Pri</span>
                <span className="w-5">User</span>
                <span className="w-16 text-right">Due</span>
                <span className="w-6" />
              </div>
              <CardContent className="p-1">
                {tasksLoading ? (
                  <div className="space-y-1 p-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-9 rounded-lg" />
                    ))}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CheckSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No tasks yet
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setCreateForStatus("TODO");
                        setCreatingTask(true);
                      }}
                    >
                      Add the first task →
                    </Button>
                  </div>
                ) : (
                  KANBAN_COLUMNS.map((status) => {
                    const col = tasksByStatus[status];
                    if (col.length === 0) return null;
                    return (
                      <div key={status}>
                        <div className="flex items-center gap-2 px-3 py-1.5">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              TASK_STATUS_CONFIG[status].color,
                            )}
                          />
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {TASK_STATUS_CONFIG[status].label} · {col.length}
                          </span>
                        </div>
                        {col.map((task) => (
                          <TaskListRow
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Analytics Tab ── */}
          <TabsContent value="analytics" className="mt-0">
            <ProjectAnalyticsTab tasks={tasks} />
          </TabsContent>

          {/* ── Members Tab ── */}
          <TabsContent value="members" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Members</CardTitle>
                <CardDescription>
                  Team members with access to this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No members found.
                  </p>
                ) : (
                  members.map((member) => {
                    const taskCount = tasks.filter(
                      (t) => t.assignedToId === member.userId,
                    ).length;
                    const doneCount = tasks.filter(
                      (t) =>
                        t.assignedToId === member.userId && t.status === "DONE",
                    ).length;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={member.user.avatarUrl ?? undefined}
                          />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.user.email}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">
                            {taskCount} tasks
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doneCount} done
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] shrink-0"
                        >
                          {member.role}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Dialogs ── */}
        <CreateTaskDialog
          open={creatingTask}
          onClose={() => setCreatingTask(false)}
          projectId={id}
          defaultStatus={createForStatus}
          members={members}
        />

        {editingProject && (
          <EditProjectDialog
            open={editingProject}
            onClose={() => setEditingProject(false)}
            project={project}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
