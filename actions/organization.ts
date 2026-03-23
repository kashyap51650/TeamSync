"use server";

import { authenticatedAction } from "@/lib/action";
import {
  addMemberToOrganization,
  createOrganization,
  removeTeamMemberFromOrganization,
  getUserTasksInOrganization,
} from "@/server/repositories/organization.repository";
import { revalidatePath, updateTag } from "next/cache";

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

export const removeTeamMemberAction = authenticatedAction(
  async (_user, organizationId: string, userId: string) => {
    const assignedTasks = await getUserTasksInOrganization(userId, organizationId);

    if (assignedTasks.length > 0) {
      return {
        success: false,
        warning: true,
        message: "This member has active tasks assigned",
        taskCount: assignedTasks.length,
        tasks: assignedTasks,
      };
    }

    await removeTeamMemberFromOrganization(organizationId, userId);

    updateTag("organization-" + organizationId);
    updateTag("projects-list-" + organizationId);
    revalidatePath("/");

    return {
      success: true,
      message: "Member removed from organization",
    };
  },
);

export const forceRemoveTeamMemberAction = authenticatedAction(
  async (_user, organizationId: string, userId: string) => {
    await removeTeamMemberFromOrganization(organizationId, userId);

    updateTag("organization-" + organizationId);
    updateTag("projects-list-" + organizationId);
    revalidatePath("/");

    return {
      success: true,
      message: "Member removed and all tasks unassigned",
    };
  },
);
