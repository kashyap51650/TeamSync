"use server";

import { authenticatedAction } from "@/lib/action";
import {
  addMemberToOrganization,
  createOrganization,
} from "@/server/repositories/organization.repository";
import { revalidatePath } from "next/cache";

export const createOrganizationAction = authenticatedAction(
  async (user, data: { name: string; slug: string; logoUrl?: string }) => {
    const org = await createOrganization({
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl || undefined,
      createdById: user.sub,
    });

    revalidatePath("/");
    return org;
  },
);

export const addMemberToOrganizationAction = authenticatedAction(
  async (
    _user,
    data: {
      organizationId: string;
      email: string;
      role: "ADMIN" | "MANAGER" | "MEMBER";
    },
  ) => {
    await addMemberToOrganization({
      organizationId: data.organizationId,
      email: data.email,
      role: data.role,
    });
  },
);
