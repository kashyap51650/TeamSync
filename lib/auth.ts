// src/lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/server/services/auth.service";
import type { JWTPayload } from "@/types";

export async function getAuthUser(
  req: NextRequest,
): Promise<JWTPayload | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
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
