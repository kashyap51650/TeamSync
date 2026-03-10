// "use server";

import type { AuthUser } from "@/types";

const BASE = "/api/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export async function loginApi(
  payload: LoginPayload,
): Promise<{ user: AuthUser; accessToken: string }> {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Login failed");
  }
  return res.json();
}

export async function registerApi(
  payload: RegisterPayload,
): Promise<{ user: AuthUser; accessToken: string }> {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Registration failed");
  }
  return res.json();
}

export async function refreshApi(): Promise<{
  user: AuthUser;
  accessToken: string;
} | null> {
  const res = await fetch(`${BASE}/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function logoutApi(): Promise<void> {
  await fetch(`${BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
}
