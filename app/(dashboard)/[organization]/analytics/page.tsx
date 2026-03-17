// src/app/(dashboard)/analytics/page.tsx
"use client";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { getInitials } from "@/lib/utils";
import type { ProjectAnalytics, WorkloadDistribution } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function WorkloadChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "workload"],
    queryFn: () =>
      apiClient
        .get<{ data: WorkloadDistribution[] }>("/api/analytics?type=workload")
        .then((r) => r.data ?? []),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Workload Distribution</CardTitle>
        <CardDescription>Active tasks per team member</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)
        ) : data?.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No team members yet
          </p>
        ) : (
          data?.map((member) => {
            const total = member.taskCount + member.completedCount;
            const pct =
              total > 0 ? Math.round((member.taskCount / total) * 100) : 0;

            return (
              <div key={member.userId} className="flex items-center gap-3">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(member.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">
                      {member.userName}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {member.taskCount} active
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function ProjectCompletionChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "projects"],
    queryFn: () =>
      apiClient
        .get<{ data: ProjectAnalytics[] }>("/api/analytics?type=projects")
        .then((r) => r.data ?? []),
  });

  const chartData = data?.map((p) => ({
    name: p.projectName.slice(0, 14),
    rate: p.completionRate,
    total: p.totalTasks,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Project Completion Rates</CardTitle>
        <CardDescription>
          Percentage of tasks completed per project
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56" />
        ) : !chartData?.length ? (
          <div className="flex h-56 items-center justify-center">
            <p className="text-sm text-muted-foreground">No project data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
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
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(val) => [`${val}%`, "Completion"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.rate >= 75
                        ? "#10b981"
                        : entry.rate >= 40
                          ? "#6366f1"
                          : "#f59e0b"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your team&apos;s performance and project progress
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProductivityChart />
        <WorkloadChart />
      </div>

      <ProjectCompletionChart />
    </div>
  );
}
