import { getTeamMembers } from "@/server/repositories/organization.repository";
import { getOrgId } from "@/server/repositories/projects.repository";
import { getUsers } from "@/server/repositories/users.repository";

export const fetchUsers = async () => {
  "use cache";
  try {
    const users = await getUsers();
    return users;
  } catch (error) {
    console.error("Error fetching users", error);
    throw error;
  }
};

export const fetchTeamMembers = async (userId: string | undefined) => {
  "use cache";
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch team members");
    }

    const orgId = await getOrgId(userId);
    if (!orgId) {
      throw new Error("Organization not found for user");
    }
    const teamMembers = await getTeamMembers(orgId);
    return teamMembers.map((member) => {
      return {
        id: member.id,
        name: member.user.name || "Unknown User",
      };
    });
  } catch (error) {
    console.error("Error fetching team member", error);
    throw error;
  }
};
