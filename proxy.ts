import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "./lib/auth";
import { fetchFirstOrganizationByUser } from "./services/organization";
import { rotateRefreshToken } from "./server/services/auth.service";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_OPTIONS,
} from "./lib/constant";
import type { JWTPayload } from "./types";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow API events (SSE)
  if (pathname.startsWith("/api/events")) {
    return NextResponse.next();
  }

  let user = await getAuthUser(req);
  let freshTokens: { accessToken: string; refreshToken: string } | null = null;

  if (!user) {
    const oldRefreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (oldRefreshToken) {
      try {
        const result = await rotateRefreshToken(oldRefreshToken);
        freshTokens = {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        };

        user = {
          sub: result.user.id,
          email: result.user.email,
          name: result.user.name,
          iat: 0,
          exp: 0,
        } satisfies JWTPayload;
      } catch {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let response: NextResponse;
  if (pathname === "/") {
    const organization = await fetchFirstOrganizationByUser(user.sub);
    response = organization
      ? NextResponse.redirect(new URL(`/${organization.slug}`, req.url))
      : NextResponse.next();
  } else {
    response = NextResponse.next();
  }

  response.headers.set("x-user-id", user.sub);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  if (freshTokens) {
    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      freshTokens.accessToken,
      ACCESS_TOKEN_OPTIONS,
    );
    response.cookies.set(
      REFRESH_TOKEN_COOKIE,
      freshTokens.refreshToken,
      REFRESH_TOKEN_OPTIONS,
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
