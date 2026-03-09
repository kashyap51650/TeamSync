// src/features/tasks/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Task, ApiResponse } from "@/types";

export const taskKeys = {
  all: ["tasks"] as const,
  byProject: (projectId: string) => ["tasks", "project", projectId] as const,
  myTasks: () => ["tasks", "mine"] as const,
  detail: (id: string) => ["tasks", id] as const,
};

export function useTasksByProject(projectId: string) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () =>
      apiClient
        .get<ApiResponse<Task[]>>(`/api/tasks?projectId=${projectId}`)
        .then((r) => r.data ?? []),
    enabled: !!projectId,
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: taskKeys.myTasks(),
    queryFn: () =>
      apiClient
        .get<ApiResponse<Task[]>>("/api/tasks")
        .then((r) => r.data ?? []),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () =>
      apiClient.get<ApiResponse<Task>>(`/api/tasks/${id}`).then((r) => r.data!),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task>) =>
      apiClient
        .post<ApiResponse<Task>>("/api/tasks", data)
        .then((r) => r.data!),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: taskKeys.byProject(task.projectId) });
      qc.invalidateQueries({ queryKey: taskKeys.myTasks() });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Task> & { id: string }) =>
      apiClient
        .patch<ApiResponse<Task>>(`/api/tasks/${id}`, data)
        .then((r) => r.data!),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: taskKeys.byProject(task.projectId) });
      qc.invalidateQueries({ queryKey: taskKeys.myTasks() });
      qc.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
