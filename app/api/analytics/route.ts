// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as analyticsRepo from "@/server/repositories/analytics.repository";
import type { JWTPayload } from "@/types";
import { prisma } from "@/lib/prisma";

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.organizationId ?? null;
}

export const GET = requireAuth(async (req: NextRequest, user: JWTPayload) => {
  const orgId = await getOrgId(user.sub);
  if (!orgId)
    return NextResponse.json({ error: "No organization" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "overview";

  switch (type) {
    case "overview": {
      const stats = await analyticsRepo.getOrgAnalytics(orgId);
      return NextResponse.json({ data: stats });
    }
    case "productivity": {
      const days = Number(searchParams.get("days") ?? "14");
      const data = await analyticsRepo.getProductivityOverTime(orgId, days);
      return NextResponse.json({ data });
    }
    case "workload": {
      const data = await analyticsRepo.getWorkloadDistribution(orgId);
      return NextResponse.json({ data });
    }
    case "projects": {
      const data = await analyticsRepo.getProjectCompletionRates(orgId);
      return NextResponse.json({ data });
    }
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
});
