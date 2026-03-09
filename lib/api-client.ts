import { refreshApi } from "@/actions/auth";
import { useAuthStore } from "@/store/auth";

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const token = useAuthStore.getState().accessToken;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async refreshAndRetry<T>(fn: () => Promise<Response>): Promise<T> {
    const refreshResult = await refreshApi();
    if (refreshResult) {
      useAuthStore
        .getState()
        .setAuth(refreshResult.user, refreshResult.accessToken);
      const retryRes = await fn();
      if (!retryRes.ok) throw new Error("Request failed after refresh");
      return retryRes.json();
    }
    useAuthStore.getState().clearAuth();
    throw new Error("Session expired");
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();

    const makeRequest = () =>
      fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
        credentials: "include",
      });

    const res = await makeRequest();

    if (res.status === 401) {
      return this.refreshAndRetry<T>(makeRequest);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error ?? "Request failed");
    }

    return res.json();
  }

  get<T>(url: string) {
    return this.request<T>(url, { method: "GET" });
  }

  post<T>(url: string, body: unknown) {
    return this.request<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  patch<T>(url: string, body: unknown) {
    return this.request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete<T>(url: string) {
    return this.request<T>(url, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
