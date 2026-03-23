import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@/types";

export async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.organizationId ?? null;
}

export async function findProjectsByOrg(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId },
    include: {
      members: true,
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function findProjectById(id: string) {
  return prisma.project.findFirst({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      tasks: true,
      _count: { select: { tasks: true } },
    },
  });
}

export async function findProjectMembers(projectId: string) {
  return prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      project: {
        select: {
          tasks: { select: { assignedToId: true, status: true } },
        },
      },
    },
  });
}

export async function findProjectTasks(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
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
  const newProject = await prisma.project.create({
    data,
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: newProject.id,
      userId: data.createdById,
    },
  });

  return newProject;
}

export async function updateProject(
  id: string,
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

export async function addProjectMembers(projectId: string, userIds: string[]) {
  if (userIds.length === 0) return;

  return prisma.projectMember.createMany({
    data: userIds.map((userId) => ({ projectId, userId })),
    skipDuplicates: true,
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

export async function getUserTasksInProject(userId: string, projectId: string) {
  return await prisma.task.findMany({
    where: {
      projectId: projectId,
      assignedToId: userId,
      status: {
        notIn: ["DONE", "CANCELLED"],
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });
}

export async function removeProjectMember(projectId: string, userId: string) {
  await prisma.task.updateMany({
    where: {
      projectId: projectId,
      assignedToId: userId,
      status: {
        notIn: ["DONE", "CANCELLED"],
      },
    },
    data: {
      assignedToId: null,
    },
  });

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
}
