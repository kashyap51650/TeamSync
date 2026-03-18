// src/lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/server/services/auth.service";
import type { JWTPayload } from "@/types";
import { cookies, headers } from "next/headers";

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

// Cookie helpers
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const ACCESS_TOKEN_COOKIE = "access_token";

export function setAccessTokenCookie(
  response: NextResponse,
  token: string,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  });
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
  response.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
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
