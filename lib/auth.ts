// src/lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/server/services/auth.service";
import type { JWTPayload } from "@/types";
import { cookies, headers } from "next/headers";
import bcrypt from "bcrypt";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_OPTIONS,
} from "./constant";

export async function getAuthUser(
  req?: NextRequest,
): Promise<JWTPayload | null> {
  let token: string | undefined;
  if (req) {
    const cookieToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    token = cookieToken;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  }
  if (!token) return null;
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(
  handler: (
    req: NextRequest,
    user: JWTPayload,
    ctx?: unknown,
  ) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx?: unknown) => {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, user, ctx);
  };
}

export function setAccessTokenCookie(
  response: NextResponse,
  token: string,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, token, ACCESS_TOKEN_OPTIONS);
}

export function clearAccessTokenCookie(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export function setRefreshTokenCookie(
  response: NextResponse,
  token: string,
): void {
  response.cookies.set(REFRESH_TOKEN_COOKIE, token, REFRESH_TOKEN_OPTIONS);
}

export function clearRefreshTokenCookie(response: NextResponse): void {
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getAuthUserId() {
  const header = await headers();
  const userId = header.get("x-user-id");

  return userId;
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const user = await getAuthUser();
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
