"use client";
// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

// Icons

import { STATUS_PIE_COLORS } from "@/lib/constant";
import {
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  cn,
  isOverdue,
} from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";

export function ProjectAnalyticsTab({ tasks }: Readonly<{ tasks: Task[] }>) {
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
