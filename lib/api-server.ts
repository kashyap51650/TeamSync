import "server-only";
import { cookies } from "next/headers";

class ApiServerClient {
  private async getHeaders(): Promise<HeadersInit> {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();

    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
      cache: "no-store",
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

export const apiServer = new ApiServerClient();
