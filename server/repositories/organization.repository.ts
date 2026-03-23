import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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
  const [adminOrganizations, memberOrganizations] = await Promise.all([
    prisma.organization.findMany({
      where: {
        members: { some: { userId, role: "ADMIN" } },
      },
      include: {
        projects: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.organization.findMany({
      where: {
        members: { some: { userId, role: { in: ["MEMBER", "MANAGER"] } } },
      },
      include: {
        projects: {
          where: {
            members: { some: { userId } },
          },
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  return [...adminOrganizations, ...memberOrganizations];
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

export async function checkUserisOrganizationMember(userId: string, organizationSlug: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      slug: organizationSlug,
    },
    include: {
      members: {
        where: {
          userId: userId,
        },
      },
    },
  });

  return !!organization?.members.length;
}

export async function checkUserisOrganizationAdmin(userId: string, organizationSlug: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      slug: organizationSlug,
    },
    include: {
      members: {
        where: {
          userId: userId,
          role: "ADMIN",
        },
      },
    },
  });

  return !!organization?.members.length;
}

export async function addMemberToOrganization(data: {
  organizationId: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
}) {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new PrismaClientKnownRequestError("User not found", {
      code: "P2025",
      clientVersion: "",
    });
  }

  await prisma.teamMember.create({
    data: {
      organizationId: data.organizationId,
      userId: user.id,
      role: data.role,
    },
  });
}

export async function getUserTasksInOrganization(userId: string, organizationId: string) {
  return await prisma.task.findMany({
    where: {
      assignedToId: userId,
      project: {
        organizationId: organizationId,
      },
      status: {
        notIn: ["DONE", "CANCELLED"],
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function removeTeamMemberFromOrganization(organizationId: string, userId: string) {
  const projectIds = await prisma.project.findMany({
    where: {
      organizationId: organizationId,
    },
    select: {
      id: true,
    },
  });

  await prisma.task.updateMany({
    where: {
      projectId: { in: projectIds.map((p) => p.id) },
      assignedToId: userId,
    },
    data: {
      assignedToId: null,
    },
  });

  await prisma.projectMember.deleteMany({
    where: {
      projectId: { in: projectIds.map((p) => p.id) },
      userId: userId,
    },
  });

  await prisma.teamMember.delete({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });
}

export async function getOrganizationMemberCount(organizationId: string) {
  return await prisma.teamMember.count({
    where: {
      organizationId: organizationId,
    },
  });
}
