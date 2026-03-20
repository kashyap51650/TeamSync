import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { getAuthUserId } from "@/lib/auth";
import { fetchOrganizationByUser } from "@/services/organization";
import { fetchUserDetails } from "@/services/user";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

async function DashboardContent({ children }: { children: React.ReactNode }) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/login");

  const [organizations, user] = await Promise.all([
    fetchOrganizationByUser(userId),
    fetchUserDetails(userId),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar organizations={organizations} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
