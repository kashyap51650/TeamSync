import { getTeamMembers } from "@/server/repositories/organization.repository";
import { TeamMember } from "@/types";
import { cacheTag } from "next/cache";

export const fetchOrganizationTeamMembers = async (
  organizationId: string,
): Promise<TeamMember[]> => {
  "use cache";
  cacheTag(`organization-${organizationId}-team-members`);
  try {
    const teamMembers = await getTeamMembers(organizationId);

    return teamMembers.map((member) => ({
      id: member.id,
      userId: member.userId,
      organizationId: member.organizationId,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatarUrl: member.user.avatarUrl,
      },
    }));
  } catch (error) {
    console.error("Error fetching organization team members", error);
    throw error;
  }
};
