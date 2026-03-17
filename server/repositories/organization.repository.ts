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

export async function createOrganization(data: {
  name: string;
  slug: string;
  logoUrl?: string;
  createdById: string;
}) {
  return await prisma.organization.create({
    data: {
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl,
      createdById: data.createdById,
      members: {
        create: {
          userId: data.createdById,
          role: "ADMIN",
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

export async function getOrganizationBySlug(slug: string) {
  console.log("Fetching organization by slug:", slug);
  return await prisma.organization.findUnique({
    where: {
      slug: slug,
    },
  });
}

export async function getOrganizationById(id: string) {
  return await prisma.organization.findUnique({
    where: {
      id: id,
    },
  });
}
