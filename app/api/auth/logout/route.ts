import { NextRequest, NextResponse } from "next/server";
import { revokeRefreshToken } from "@/server/services/auth.service";
import {
  REFRESH_TOKEN_COOKIE,
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (token) {
    await revokeRefreshToken(token).catch(() => {});
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  clearAccessTokenCookie(response);
  clearRefreshTokenCookie(response);

  return response;
}
