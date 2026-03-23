// UI
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { STATUS_PIE_COLORS } from "@/lib/constant";
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, cn, isOverdue } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { ProjectAnalyticsCharts } from "./project-analytics-charts";

export async function ProjectAnalyticsTab({ tasks }: Readonly<{ tasks: Task[] }>) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const overdue = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== "DONE").length;
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
    fill: STATUS_PIE_COLORS[status as TaskStatus] ?? "#94a3b8",
  }));

  // Priority breakdown for bar
  const priorityOrder: TaskPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW", "NO_PRIORITY"];
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

  const stats = [
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
      color: overdue > 0 ? "text-red-600 dark:text-red-400" : "text-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, color }) => (
          <Card key={label} className="py-0">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className={cn("mt-1 text-2xl font-bold", color)}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion progress */}
      <Card className="py-0">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Overall Completion</p>
            <span className="text-sm font-bold text-primary">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {done} of {total} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <ProjectAnalyticsCharts pieData={pieData} barData={barData} />
    </div>
  );
}
