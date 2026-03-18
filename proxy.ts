import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "./lib/auth";
import { fetchFirstOrganizationByUser } from "./services/organization";

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

  const user = await getAuthUser(req);

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect root to first organization dashboard
  if (pathname === "/") {
    const organization = await fetchFirstOrganizationByUser(user.sub);

    if (organization) {
      const dashboardUrl = new URL(`/${organization.slug}`, req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // This middleware just provides basic security headers
  const response = NextResponse.next();

  response.headers.set("x-user-id", user.sub);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
