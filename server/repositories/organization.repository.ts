import { prisma } from "@/lib/prisma";

export async function getTeamMembers(OrganizationId: string) {
  return await prisma.teamMember.findMany({
    where: {
      organizationId: OrganizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}
