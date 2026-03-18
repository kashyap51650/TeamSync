import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { getAuthUserId } from "@/lib/auth";
import { fetchOrganizationByUser } from "@/services/organization";
import { Suspense } from "react";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize SSE for real-time updates
  // useSSE();

  const userId = await getAuthUserId()!;
  const organizations = await fetchOrganizationByUser(userId);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="flex-1 p-6">Loading...</div>}>
        <Sidebar organizations={organizations} />
      </Suspense>
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
