import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import * as repo from "@/server/repositories/tasks.repository";
import { sseManager } from "@/lib/sse";
import type { JWTPayload } from "@/types";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  assignedToId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  priority: z
    .enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NO_PRIORITY"])
    .optional(),
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"])
    .optional(),
});

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.organizationId ?? null;
}

// GET /api/tasks?projectId=xxx
export const GET = requireAuth(async (req: NextRequest, user: JWTPayload) => {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const orgId = await getOrgId(user.sub);
  if (!orgId)
    return NextResponse.json({ error: "No organization" }, { status: 404 });

  if (projectId) {
    const tasks = await repo.findTasksByProject(projectId);
    return NextResponse.json({ data: tasks });
  }

  const tasks = await repo.findTasksByUser(user.sub, orgId);
  return NextResponse.json({ data: tasks });
});

// POST /api/tasks
export const POST = requireAuth(async (req: NextRequest, user: JWTPayload) => {
  const orgId = await getOrgId(user.sub);
  if (!orgId)
    return NextResponse.json({ error: "No organization" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const task = await repo.createTask({
    ...parsed.data,
    createdById: user.sub,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
  });

  await repo.createTaskActivity({
    taskId: task.id,
    userId: user.sub,
    type: "TASK_CREATED",
    metadata: { title: task.title },
  });

  sseManager.broadcast(orgId, "task:created", task);

  if (task.assignedToId && task.assignedToId !== user.sub) {
    await prisma.notification.create({
      data: {
        userId: task.assignedToId,
        type: "TASK_ASSIGNED",
        title: "New task assigned",
        body: `You've been assigned: ${task.title}`,
        metadata: { taskId: task.id, projectId: task.projectId },
      },
    });
    sseManager.broadcastToUser(task.assignedToId, "notification:new", {
      title: "New task assigned",
      body: `You've been assigned: ${task.title}`,
    });
  }

  return NextResponse.json({ data: task }, { status: 201 });
});
