"use server";

import { after } from "next/server";
import { cookies } from "next/headers";
import {
  loginUser,
  registerUser,
  generateAccessToken,
  generateRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
} from "@/server/services/auth.service";
import type { AuthUser } from "@/types";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_OPTIONS,
} from "@/lib/constant";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export async function loginAction(
  payload: LoginPayload,
): Promise<{ ok: boolean }> {
  try {
    const user = await loginUser(payload.email, payload.password);
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_TOKEN_OPTIONS);
    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_TOKEN_OPTIONS);

    return { ok: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Login failed");
  }
}

export async function registerAction(
  payload: RegisterPayload,
): Promise<{ ok: boolean }> {
  try {
    const user = await registerUser(
      payload.email,
      payload.password,
      payload.name,
    );
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_TOKEN_OPTIONS);
    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_TOKEN_OPTIONS);

    return { ok: true };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Registration failed",
    );
  }
}

export async function logoutAction(): Promise<{ ok: boolean }> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (refreshToken) {
      after(() => revokeRefreshToken(refreshToken));
    }

    // Clear cookies
    cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
      ...ACCESS_TOKEN_OPTIONS,
      maxAge: 0,
    });
    cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
      ...REFRESH_TOKEN_OPTIONS,
      maxAge: 0,
    });

    return { ok: true };
  } catch {
    throw new Error("Logout failed");
  }
}

export async function refreshAction(): Promise<{
  user: AuthUser;
  accessToken: string;
}> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    } = await rotateRefreshToken(refreshToken);

    // Set new cookies
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_TOKEN_OPTIONS);
    cookieStore.set(
      REFRESH_TOKEN_COOKIE,
      newRefreshToken,
      REFRESH_TOKEN_OPTIONS,
    );

    return { user, accessToken };
  } catch {
    // Clear cookies on failure
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
      ...ACCESS_TOKEN_OPTIONS,
      maxAge: 0,
    });
    cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
      ...REFRESH_TOKEN_OPTIONS,
      maxAge: 0,
    });

    throw new Error("Invalid or expired refresh token");
  }
}
