import { findTasksByProject } from "@/server/repositories/tasks.repository";
import { cacheTag } from "next/cache";

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
