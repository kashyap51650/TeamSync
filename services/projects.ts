import { prisma } from "@/lib/prisma";
import {
  findProjectById,
  findProjectMembers,
  findProjectsByOrg,
  findProjectTasks,
} from "@/server/repositories/projects.repository";
import { cacheTag } from "next/cache";

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.organizationId ?? null;
}

export async function fetchProjects(userId?: string) {
  "use cache";
  cacheTag("projects-list");
  try {
    if (userId) {
      const orgId = await getOrgId(userId);
      if (!orgId) {
        throw new Error("No organization found for user");
      }
      const projects = await findProjectsByOrg(orgId);

      // Filter projects to include only those where the user is a member or creator
      const filteredProjects = projects.filter((project) => {
        const isMember = project.members.some(
          (member) => member.userId === userId,
        );
        const isCreator = project.createdById === userId;
        return isMember || isCreator;
      });

      return filteredProjects;
    }
  } catch (error) {
    console.error("Error fetching projects", error);
    throw error;
  }
}

export async function fetchMembersByProject(projectId: string) {
  try {
    const members = await findProjectMembers(projectId);
    return members;
  } catch (error) {
    console.error("Error fetching project members", error);
    throw error;
  }
}

export async function fetchTasksByProject(projectId: string) {
  "use cache";
  cacheTag(`tasks-list-${projectId}`);
  try {
    const tasks = await findProjectTasks(projectId);
    return tasks;
  } catch (error) {
    console.error("Error fetching project tasks", error);
    throw error;
  }
}

export async function fetchProjectById(projectId: string) {
  "use cache";
  cacheTag(`project-${projectId}`);
  try {
    const project = await findProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  } catch (error) {
    console.error("Error fetching project by ID", error);
    throw error;
  }
}
