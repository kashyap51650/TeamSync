// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rotateRefreshToken } from "@/server/services/auth.service";
import {
  REFRESH_TOKEN_COOKIE,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const { user, accessToken, refreshToken } = await rotateRefreshToken(token);

    const response = NextResponse.json({ user, accessToken }, { status: 200 });
    setRefreshTokenCookie(response, refreshToken);

    return response;
  } catch {
    const response = NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 },
    );
    clearRefreshTokenCookie(response);
    return response;
  }
}
