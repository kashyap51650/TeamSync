import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { JWTPayload } from "@/types";
import { prisma } from "@/lib/prisma";

const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
});

export const POST = requireAuth(async (req: NextRequest, user: JWTPayload) => {
  const body = await req.json();
  const parsed = createOrgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name } = parsed.data;
  let slug = slugify(name);

  // Ensure slug uniqueness
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      members: {
        create: {
          userId: user.sub,
          role: "ADMIN",
        },
      },
    },
  });

  return NextResponse.json({ data: org }, { status: 201 });
});
