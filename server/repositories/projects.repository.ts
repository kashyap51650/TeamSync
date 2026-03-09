import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@/types";

export async function findProjectsByOrg(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function findProjectById(id: string, organizationId: string) {
  return prisma.project.findFirst({
    where: { id, organizationId },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      members: true,
      _count: { select: { tasks: true } },
    },
  });
}

export async function createProject(data: {
  name: string;
  description?: string;
  organizationId: string;
  createdById: string;
  startDate?: Date;
  endDate?: Date;
  color?: string;
}) {
  return prisma.project.create({
    data,
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });
}

export async function updateProject(
  id: string,
  organizationId: string,
  data: Partial<{
    name: string;
    description: string;
    status: ProjectStatus;
    startDate: Date;
    endDate: Date;
    color: string;
  }>,
) {
  return prisma.project.update({
    where: { id },
    data,
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}
