class ApiClient {
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

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
