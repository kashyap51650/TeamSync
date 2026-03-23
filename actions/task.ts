"use server";

import { authenticatedAction } from "@/lib/action";
import { CreateTaskForm } from "@/schema/task-schema";
import { createTask, deleteTask, updateTask } from "@/server/repositories/tasks.repository";
import { updateTag } from "next/cache";

type CreateTaskActionData = CreateTaskForm & {
  projectId: string;
};

export const createTaskAction = authenticatedAction(async (user, data: CreateTaskActionData) => {
  const { title, description, priority, status, assignedToId, dueDate, projectId } = data;

  const task = await createTask({
    title,
    description,
    priority,
    status,
    assignedToId,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    projectId,
    createdById: user.sub,
  });
  updateTag("tasks-list-" + projectId);
  return task;
});

export const updateTaskAction = authenticatedAction(
  async (_user, taskId: string, data: Partial<CreateTaskForm>) => {
    const { title, description, priority, status, assignedToId, dueDate } = data;

    const task = await updateTask(taskId, {
      title,
      description,
      priority,
      status,
      assignedToId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    updateTag("tasks-list-" + task.projectId);
    updateTag("tasks-list");
    updateTag(`project-${task.projectId}`);
    return task;
  },
);

export const deleteTaskAction = authenticatedAction(
  async (_user, taskId: string, projectId: string) => {
    await deleteTask(taskId);
    updateTag("tasks-list-" + projectId);
  },
);
