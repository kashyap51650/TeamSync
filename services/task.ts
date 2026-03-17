import {
  findTasksByProject,
  findTasksByUser,
} from "@/server/repositories/tasks.repository";
import { cacheTag } from "next/cache";

export const fetchTasks = async (userId: string | undefined, orgId: string) => {
  "use cache";
  cacheTag("tasks-list");
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    if (!orgId) {
      throw new Error("Organization not found for user");
    }

    const tasks = await findTasksByUser(userId, orgId);
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks", error);
    throw error;
  }
};

export const fetchTasksByProject = async (projectId: string) => {
  "use cache";
  cacheTag(`tasks-list-${projectId}`);
  try {
    const tasks = await findTasksByProject(projectId);
    return tasks;
  } catch (error) {
    console.error("Error fetching project tasks", error);
    throw error;
  }
};
