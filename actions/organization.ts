"use server";

import { getAuthUser } from "@/lib/auth";
import { createOrganization } from "@/server/repositories/organization.repository";
import { revalidatePath } from "next/cache";

export const createOrganizationAction = async (data: {
  name: string;
  slug: string;
  logoUrl?: string;
}) => {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const org = await createOrganization({
    name: data.name,
    slug: data.slug,
    logoUrl: data.logoUrl || undefined,
    createdById: user.sub,
  });

  revalidatePath("/");
  return org;
};
