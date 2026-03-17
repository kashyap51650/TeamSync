import { getAuthUser } from "@/lib/auth";
import { fetchOrganizationAnalytics } from "@/services/dashboard";
import { fetchTasks } from "@/services/task";
import { StatsCard } from "./stats-card";
import {
  AlertCircle,
  CheckSquare,
  FolderKanban,
  TrendingUp,
} from "lucide-react";

export async function DashboardStats({
  orgId,
}: Readonly<{
  orgId: string;
}>) {
  const user = await getAuthUser();
  const tasks = await fetchTasks(user?.sub, orgId);
  const stats = await fetchOrganizationAnalytics(user?.sub, orgId);

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
