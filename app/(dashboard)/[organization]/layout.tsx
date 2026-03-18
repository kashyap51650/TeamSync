import { getAuthUser } from "@/lib/auth";
import { checkUserisOrganizationMember } from "@/server/repositories/organization.repository";
import { redirect } from "next/navigation";

export default async function OrganizationLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ organization: string }>;
}>) {
  const { organization } = await params;

  // check if user is authenticated and belongs to the organization
  const user = await getAuthUser()!;

  if (!user) {
    redirect("/login");
  }

  const isValidOrg = await checkUserisOrganizationMember(
    user.sub,
    organization,
  );

  if (!isValidOrg) {
    redirect("/unauthorized");
  }

  return (
    // <div className="flex h-screen overflow-hidden bg-background">
    //   <Sidebar organizations={organizations} />
    //   <div className="flex flex-1 flex-col overflow-hidden">
    //     <TopNav />
    //     <main className="flex-1 overflow-y-auto">
    //       <div className="p-6">{children}</div>
    //     </main>
    //   </div>
    // </div>

    <div>{children}</div>
  );
}
