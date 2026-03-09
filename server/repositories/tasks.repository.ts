import { prisma } from "@/lib/prisma";
import type { TaskStatus, TaskPriority } from "@/types";
import { ActivityType } from "@prisma/client";

export async function findTasksByProject(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true } },
      labels: true,
      _count: { select: { activities: true } },
    },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });
}

export async function findTasksByUser(userId: string, organizationId: string) {
  return prisma.task.findMany({
    where: {
      assignedToId: userId,
      project: { organizationId },
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      labels: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
}

export async function findTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      labels: true,
      activities: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function createTask(data: {
  title: string;
  description?: string;
  projectId: string;
  createdById: string;
  assignedToId?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
}) {
  // Get max position in project/status
  const maxPos = await prisma.task.aggregate({
    where: { projectId: data.projectId, status: data.status ?? "BACKLOG" },
    _max: { position: true },
  });

  return prisma.task.create({
    data: {
      ...data,
      status: data.status ?? "BACKLOG",
      priority: data.priority ?? "NO_PRIORITY",
      position: (maxPos._max.position ?? 0) + 1,
    },
    include: {
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true } },
      labels: true,
      project: { select: { id: true, name: true, color: true } },
    },
  });
}

export async function updateTask(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedToId: string | null;
    dueDate: Date | null;
    position: number;
    completedAt: Date | null;
  }>,
) {
  return prisma.task.update({
    where: { id },
    data: {
      ...data,
      completedAt: data.status === "DONE" ? new Date() : data.completedAt,
    },
    include: {
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true } },
      labels: true,
      project: { select: { id: true, name: true, color: true } },
    },
  });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}

export async function createTaskActivity(data: {
  taskId: string;
  userId: string;
  type: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.taskActivity.create({
    data: {
      taskId: data.taskId,
      userId: data.userId,
      type: data.type as ActivityType,
      //   metadata: data.metadata ?? {},
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}
