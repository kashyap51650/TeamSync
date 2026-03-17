import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { getAuthUser } from "@/lib/auth";
import { fetchOrganizationByUser } from "@/services/organization";

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { slug: string };
}>) {
  // Initialize SSE for real-time updates
  // useSSE();

  const user = await getAuthUser()!;

  const organizations = await fetchOrganizationByUser(user?.sub);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar organizations={organizations} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
