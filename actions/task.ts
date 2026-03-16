"use server";

import { getAuthUser } from "@/lib/auth";
import { CreateTaskForm } from "@/schema/task-schema";
import {
  createTask,
  deleteTask,
  updateTask,
} from "@/server/repositories/tasks.repository";
import { updateTag } from "next/cache";

type CreateTaskActionData = CreateTaskForm & {
  projectId: string;
};

export const createTaskAction = async (data: CreateTaskActionData) => {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const {
    title,
    description,
    priority,
    status,
    assignedToId,
    dueDate,
    projectId,
  } = data;

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
  updateTag("tasks-list");
  return task;
};
export const updateTaskAction = async (
  taskId: string,
  data: Partial<CreateTaskForm>,
) => {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { title, description, priority, status, assignedToId, dueDate } = data;

  const task = await updateTask(taskId, {
    title,
    description,
    priority,
    status,
    assignedToId,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });
  updateTag("tasks-list");
  return task;
};

export const deleteTaskAction = async (taskId: string) => {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await deleteTask(taskId);
  updateTag("tasks-list");
};
