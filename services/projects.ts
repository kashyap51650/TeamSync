import { prisma } from "@/lib/prisma";
import { findProjectsByOrg } from "@/server/repositories/projects.repository";
import { cacheTag } from "next/cache";

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.organizationId ?? null;
}

export async function fetchProjects(userId?: string) {
  "use cache";
  cacheTag("projects-list");
  try {
    if (userId) {
      const orgId = await getOrgId(userId);
      if (!orgId) {
        throw new Error("No organization found for user");
      }
      const projects = await findProjectsByOrg(orgId);
      return projects;
    }
  } catch (error) {
    console.error("Error fetching projects", error);
    throw error;
  }
}
