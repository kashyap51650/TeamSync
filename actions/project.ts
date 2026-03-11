"use server";

import { getAuthUser } from "@/lib/auth";
import {
  createProject,
  deleteProject,
  getOrgId,
} from "@/server/repositories/projects.repository";
import { updateTag } from "next/cache";

export const deleteProjectAction = async (id: string) => {
  await deleteProject(id);
  updateTag("projects-list");
};

export const createProjectAction = async (data: {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  color?: string;
}) => {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

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
  return project;
};
