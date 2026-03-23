"use server";

import { authenticatedAction } from "@/lib/action";
import {
  createProject,
  deleteProject,
  addProjectMembers,
  getOrgId,
  updateProject,
} from "@/server/repositories/projects.repository";
import { revalidateTag, updateTag } from "next/cache";

export const deleteProjectAction = authenticatedAction(async (_user, id: string) => {
  await deleteProject(id);
  updateTag("projects-list");
});

export const addProjectMembersAction = authenticatedAction(
  async (_user, projectId: string, userIds: string[]) => {
    await addProjectMembers(projectId, userIds);
    updateTag(`project-${projectId}`);
  },
);

export const createProjectAction = authenticatedAction(
  async (
    user,
    data: {
      name: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      color?: string;
    },
  ) => {
    const orgId = await getOrgId(user.sub);

    if (!orgId) {
      throw new Error("No organization found for user");
    }

    const { name, description, startDate, endDate, color } = data;

    const project = await createProject({
      name,
      description,
      organizationId: orgId,
      createdById: user.sub,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      color,
    });

    updateTag("projects-list");
    updateTag("analytics-overview");
    return project;
  },
);

export const updateProjectAction = authenticatedAction(
  async (
    _user,
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      color?: string;
    }>,
  ) => {
    const { name, description, startDate, endDate, color } = data;

    const project = await updateProject(id, {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      color,
    });

    revalidateTag("projects-list", "max");
    return project;
  },
);
