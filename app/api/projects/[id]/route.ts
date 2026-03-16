// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import * as repo from "@/server/repositories/projects.repository";
import { sseManager } from "@/lib/sse";
import type { JWTPayload } from "@/types";
import { prisma } from "@/lib/prisma";

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.organizationId ?? null;
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z
    .enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  color: z.string().optional(),
});

// GET /api/projects/[id]
export const GET = requireAuth(
  async (_req: NextRequest, user: JWTPayload, ctx: unknown) => {
    const { id } = (ctx as { params: { id: string } }).params;
    const orgId = await getOrgId(user.sub);
    if (!orgId)
      return NextResponse.json({ error: "No organization" }, { status: 404 });

    const project = await repo.findProjectById(id);
    if (!project)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: project });
  },
);

// PATCH /api/projects/[id]
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

    const updated = await repo.updateProject(id, orgId, {
      ...parsed.data,
      startDate: parsed.data.startDate
        ? new Date(parsed.data.startDate)
        : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    sseManager.broadcast(orgId, "project:updated", updated);

    return NextResponse.json({ data: updated });
  },
);

// DELETE /api/projects/[id]
export const DELETE = requireAuth(
  async (_req: NextRequest, user: JWTPayload, ctx: unknown) => {
    const { id } = (ctx as { params: { id: string } }).params;
    const orgId = await getOrgId(user.sub);
    if (!orgId)
      return NextResponse.json({ error: "No organization" }, { status: 404 });

    await repo.deleteProject(id);
    sseManager.broadcast(orgId, "project:deleted", { id });

    return NextResponse.json({ ok: true });
  },
);
