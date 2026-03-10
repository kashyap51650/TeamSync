"use client";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckSquare,
  FolderKanban,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import type { TeamAnalytics } from "@/types";
import { useProjects } from "@/hooks/use-project";
import { useMyTasks } from "@/hooks/use-tasks";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { TaskStatusChart } from "@/components/dashboard/task-status-chart";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () =>
      apiClient
        .get<{ data: TeamAnalytics }>("/api/analytics?type=overview")
        .then((r) => r.data),
  });

  const { data: projects } = useProjects();
  const { data: tasks } = useMyTasks();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const myOpenTasks =
    tasks?.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED")
      .length ?? 0;

  const completionRate =
    stats && stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        label="Total Projects"
        value={stats?.totalProjects ?? 0}
        icon={FolderKanban}
        description="Active workspaces"
        trend={{ value: 12, label: "vs last month" }}
        color="blue"
      />
      <StatsCard
        label="My Open Tasks"
        value={myOpenTasks}
        icon={CheckSquare}
        description="Assigned to you"
        color="indigo"
      />
      <StatsCard
        label="Completion Rate"
        value={`${completionRate}%`}
        icon={TrendingUp}
        description="Tasks completed"
        trend={{ value: 8, label: "vs last week" }}
        color="green"
      />
      <StatsCard
        label="Overdue Tasks"
        value={stats?.overdueTasks ?? 0}
        icon={AlertCircle}
        description="Need attention"
        color="red"
        urgent={!!stats?.overdueTasks && stats.overdueTasks > 0}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your team today.
        </p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductivityChart />
        </div>
        <TaskStatusChart />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentProjects />
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
