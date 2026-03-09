// src/app/api/team/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import type { JWTPayload } from "@/types";
import { prisma } from "@/lib/prisma";

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.organizationId ?? null;
}

// GET /api/team
export const GET = requireAuth(async (_req: NextRequest, user: JWTPayload) => {
  const orgId = await getOrgId(user.sub);
  if (!orgId)
    return NextResponse.json({ error: "No organization" }, { status: 404 });

  const members = await prisma.teamMember.findMany({
    where: { organizationId: orgId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json({ data: members });
});

// POST /api/team/invite
const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]).default("MEMBER"),
});

export const POST = requireAuth(async (req: NextRequest, user: JWTPayload) => {
  const orgId = await getOrgId(user.sub);
  if (!orgId)
    return NextResponse.json({ error: "No organization" }, { status: 404 });

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, role } = parsed.data;

  // Find user by email
  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) {
    return NextResponse.json(
      { error: "User not found with that email" },
      { status: 404 },
    );
  }

  // Check already a member
  const existing = await prisma.teamMember.findUnique({
    where: {
      userId_organizationId: { userId: invitee.id, organizationId: orgId },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "User is already a team member" },
      { status: 409 },
    );
  }

  const member = await prisma.teamMember.create({
    data: { userId: invitee.id, organizationId: orgId, role },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json({ data: member }, { status: 201 });
});
