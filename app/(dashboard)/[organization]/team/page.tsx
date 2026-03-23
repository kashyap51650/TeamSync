import { MemberCard } from "@/components/team/member-card";
import { TeamHeader } from "@/components/team/team-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthUserId } from "@/lib/auth";
import { fetchOrganizationBySlug } from "@/services/organization";
import { fetchOrganizationTeamMembers } from "@/services/team";
import { Users } from "lucide-react";
import { Suspense } from "react";

function TeamPageFallback() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i + 1} className="h-18 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default async function TeamPage({
  params,
}: Readonly<{
  params: Promise<{ organization: string }>;
}>) {
  const useId = await getAuthUserId();
  const { organization } = await params;
  const currentOrg = await fetchOrganizationBySlug(organization);
  const members = await fetchOrganizationTeamMembers(currentOrg.id);

  const userRole = members.find((member) => member.user.id === useId)?.role;

  const isShowInviteButton = userRole === "ADMIN" || userRole === "MANAGER";

  return (
    <Suspense fallback={<TeamPageFallback />}>
      <div className="space-y-6 animate-fade-in">
        <TeamHeader
          members={members}
          orgId={currentOrg.id}
          isShowInviteButton={isShowInviteButton}
        />
        {members?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <h3 className="font-semibold">No team members yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Invite colleagues to collaborate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members?.map((member) => (
              <MemberCard key={member.id} member={member} organizationId={currentOrg.id} />
            ))}
          </div>
        )}
      </div>
    </Suspense>
  );
}
