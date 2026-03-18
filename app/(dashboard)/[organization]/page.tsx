import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { TaskStatusChart } from "@/components/dashboard/task-status-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthUser } from "@/lib/auth";
import { fetchProductivityOverTime } from "@/services/dashboard";
import { fetchOrganizationBySlug } from "@/services/organization";
import { fetchProjects } from "@/services/projects";
import { fetchTasks } from "@/services/task";
import { Suspense } from "react";

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage({
  params,
}: Readonly<{
  params: Promise<{ organization: string }>;
}>) {
  const user = await getAuthUser();
  const { organization } = await params;
  const currentOrg = await fetchOrganizationBySlug(organization);

  const productivityData = fetchProductivityOverTime(currentOrg.id, 14);
  const projects = fetchProjects(user?.sub, currentOrg.id);
  const tasks = fetchTasks(user?.sub, currentOrg.id);

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
        <DashboardStats orgId={currentOrg.id} />
      </Suspense>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-56 w-full" />}>
            <ProductivityChart data={productivityData} />
          </Suspense>
        </div>
        <TaskStatusChart data={tasks} />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense
            fallback={[new Array(4)].map((_, i) => (
              <Skeleton key={i + 1} className="h-16 rounded-lg" />
            ))}
          >
            <RecentProjects projects={projects} />
          </Suspense>
        </div>
        <Suspense
          fallback={new Array(5).map((_, i) => (
            <div key={i + 1} className="flex items-start gap-3">
              <Skeleton className="h-7 w-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        >
          <ActivityFeed data={tasks} />
        </Suspense>
      </div>
    </div>
  );
}
