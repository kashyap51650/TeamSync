import { prisma } from "@/lib/prisma";
import { subDays, format } from "date-fns";

export async function getOrgAnalytics(organizationId: string, userId: string) {
  const [totalMembers, projects, tasks] = await Promise.all([
    prisma.teamMember.count({ where: { organizationId } }),
    prisma.project.findMany({
      where: {
        organizationId,
        members: { some: { userId } },
      },
      include: { _count: { select: { tasks: true } } },
    }),
    prisma.task.findMany({
      where: { project: { organizationId } },
      select: {
        id: true,
        status: true,
        dueDate: true,
        completedAt: true,
        createdAt: true,
      },
    }),
  ]);

  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE",
  ).length;

  return {
    totalMembers,
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks,
    overdueTasks,
  };
}

export async function getProductivityOverTime(
  organizationId: string,
  days = 14,
) {
  const since = subDays(new Date(), days);

  const [created, completed] = await Promise.all([
    prisma.task.groupBy({
      by: ["createdAt"],
      where: {
        project: { organizationId },
        createdAt: { gte: since },
      },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ["completedAt"],
      where: {
        project: { organizationId },
        completedAt: { gte: since },
        status: "DONE",
      },
      _count: true,
    }),
  ]);

  // Build day-by-day map
  const dateMap: Record<string, { created: number; completed: number }> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    dateMap[d] = { created: 0, completed: 0 };
  }

  created.forEach((r) => {
    const d = format(new Date(r.createdAt), "yyyy-MM-dd");
    if (dateMap[d]) dateMap[d].created += r._count;
  });

  completed.forEach((r) => {
    if (r.completedAt) {
      const d = format(new Date(r.completedAt), "yyyy-MM-dd");
      if (dateMap[d]) dateMap[d].completed += r._count;
    }
  });

  return Object.entries(dateMap).map(([date, values]) => ({
    date,
    ...values,
  }));
}

export async function getWorkloadDistribution(organizationId: string) {
  const members = await prisma.teamMember.findMany({
    where: { organizationId },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  const distribution = await Promise.all(
    members.map(async (member) => {
      const [total, completed] = await Promise.all([
        prisma.task.count({
          where: {
            assignedToId: member.userId,
            project: { organizationId },
            status: { notIn: ["DONE", "CANCELLED"] },
          },
        }),
        prisma.task.count({
          where: {
            assignedToId: member.userId,
            project: { organizationId },
            status: "DONE",
          },
        }),
      ]);

      return {
        userId: member.userId,
        userName: member.user.name,
        avatarUrl: member.user.avatarUrl,
        taskCount: total,
        completedCount: completed,
      };
    }),
  );

  return distribution.sort((a, b) => b.taskCount - a.taskCount);
}

export async function getProjectCompletionRates(organizationId: string) {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    include: {
      tasks: { select: { id: true, status: true } },
    },
  });

  return projects.map((p) => {
    const total = p.tasks.length;
    const completed = p.tasks.filter((t) => t.status === "DONE").length;
    return {
      projectId: p.id,
      projectName: p.name,
      totalTasks: total,
      completedTasks: completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      tasksByStatus: p.tasks.reduce(
        (acc, t) => {
          acc[t.status] = (acc[t.status] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  });
}
