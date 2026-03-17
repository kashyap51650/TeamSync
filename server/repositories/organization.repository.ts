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

export async function getOrganizationByUserId(userId: string) {
  return await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
  });
}

export async function getFirstOrganizationByUserId(userId: string) {
  return await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
  });
}
