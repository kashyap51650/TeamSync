"use server";

import { authenticatedAction } from "@/lib/action";
import {
  createProject,
  deleteProject,
  addProjectMembers,
  getOrgId,
  updateProject,
  removeProjectMember,
  getUserTasksInProject,
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

export const removeProjectMemberAction = authenticatedAction(
  async (_user, projectId: string, userId: string) => {
    const assignedTasks = await getUserTasksInProject(userId, projectId);

    if (assignedTasks.length > 0) {
      return {
        success: false,
        warning: true,
        message: "This member has active tasks assigned in this project",
        taskCount: assignedTasks.length,
        tasks: assignedTasks,
      };
    }

    await removeProjectMember(projectId, userId);

    updateTag(`project-${projectId}`);
    updateTag("projects-list");

    return {
      success: true,
      message: "Member removed from project",
    };
  },
);

export const forceRemoveProjectMemberAction = authenticatedAction(
  async (_user, projectId: string, userId: string) => {
    await removeProjectMember(projectId, userId);

    updateTag(`project-${projectId}`);
    updateTag("projects-list");

    return {
      success: true,
      message: "Member removed and all tasks unassigned",
    };
  },
);
