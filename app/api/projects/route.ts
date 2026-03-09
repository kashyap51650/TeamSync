// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import * as repo from "@/server/repositories/projects.repository";
import { sseManager } from "@/lib/sse";
import type { JWTPayload } from "@/types";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  color: z.string().optional(),
});

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.organizationId ?? null;
}

// GET /api/projects
export const GET = requireAuth(async (_req, user: JWTPayload) => {
  const orgId = await getOrgId(user.sub);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 404 });
  }

  const projects = await repo.findProjectsByOrg(orgId);
  return NextResponse.json({ data: projects });
});

// POST /api/projects
export const POST = requireAuth(async (req: NextRequest, user: JWTPayload) => {
  const orgId = await getOrgId(user.sub);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, description, startDate, endDate, color } = parsed.data;

  const project = await repo.createProject({
    name,
    description,
    organizationId: orgId,
    createdById: user.sub,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    color,
  });

  // Broadcast to org members
  sseManager.broadcast(orgId, "project:created", project);

  return NextResponse.json({ data: project }, { status: 201 });
});
