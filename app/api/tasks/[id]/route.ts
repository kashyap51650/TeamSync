import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import * as repo from "@/server/repositories/tasks.repository";
import { sseManager } from "@/lib/sse";
import type { JWTPayload } from "@/types";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"])
    .optional(),
  priority: z
    .enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NO_PRIORITY"])
    .optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  position: z.number().optional(),
});

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.organizationId ?? null;
}

// GET /api/tasks/[id]
export const GET = requireAuth(
  async (_req: NextRequest, user: JWTPayload, ctx: unknown) => {
    const { id } = (ctx as { params: { id: string } }).params;
    const task = await repo.findTaskById(id);
    if (!task)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: task });
  },
);

// PATCH /api/tasks/[id]
export const PATCH = requireAuth(
  async (req: NextRequest, user: JWTPayload, ctx: unknown) => {
    const { id } = (ctx as { params: { id: string } }).params;
    const orgId = await getOrgId(user.sub);
    if (!orgId)
      return NextResponse.json({ error: "No organization" }, { status: 404 });

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await repo.findTaskById(id);
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await repo.updateTask(id, {
      ...parsed.data,
      dueDate:
        parsed.data.dueDate !== undefined
          ? parsed.data.dueDate
            ? new Date(parsed.data.dueDate)
            : null
          : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Log activity if status changed
    if (parsed.data.status && parsed.data.status !== existing.status) {
      await repo.createTaskActivity({
        taskId: id,
        userId: user.sub,
        type: "TASK_STATUS_CHANGED",
        metadata: { from: existing.status, to: parsed.data.status },
      });
    }

    sseManager.broadcast(orgId, "task:updated", updated);

    return NextResponse.json({ data: updated });
  },
);

// DELETE /api/tasks/[id]
export const DELETE = requireAuth(
  async (_req: NextRequest, user: JWTPayload, ctx: unknown) => {
    const { id } = (ctx as { params: { id: string } }).params;
    const orgId = await getOrgId(user.sub);
    if (!orgId)
      return NextResponse.json({ error: "No organization" }, { status: 404 });

    await repo.deleteTask(id);
    sseManager.broadcast(orgId, "task:deleted", { id });

    return NextResponse.json({ ok: true });
  },
);
