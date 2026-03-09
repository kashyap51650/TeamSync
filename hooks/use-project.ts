import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Project, ApiResponse } from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: () =>
      apiClient
        .get<ApiResponse<Project[]>>("/api/projects")
        .then((r) => r.data ?? []),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () =>
      apiClient
        .get<ApiResponse<Project>>(`/api/projects/${id}`)
        .then((r) => r.data!),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Project>) =>
      apiClient
        .post<ApiResponse<Project>>("/api/projects", data)
        .then((r) => r.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.list() }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Project> & { id: string }) =>
      apiClient
        .patch<ApiResponse<Project>>(`/api/projects/${id}`, data)
        .then((r) => r.data!),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: projectKeys.list() });
      qc.invalidateQueries({ queryKey: projectKeys.detail(vars.id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.list() }),
  });
}
