import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { TaskStatusChart } from "@/components/dashboard/task-status-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthUser } from "@/lib/auth";
import { Suspense } from "react";

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await getAuthUser();
  const hour = new Date().getHours();
  const greeting = getGreeting(hour);

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
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {new Array(4).map((_, i) => (
              <Skeleton key={i + 1} className="h-32 rounded-xl" />
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

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
