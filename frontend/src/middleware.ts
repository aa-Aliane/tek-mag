// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Get the token from the HttpOnly cookie
  // Django usually names this 'sessionid' or 'access' depending on your JWT setup
  const token =
    request.cookies.get("access")?.value ||
    request.cookies.get("sessionid")?.value;

  const { pathname } = request.nextUrl;

  // 2. Define your protected vs public routes
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboardPage =
    pathname.startsWith("/repairs") ||
    pathname.startsWith("/stock") ||
    pathname.startsWith("/clients");

  // Logic A: Redirect to Login if trying to access dashboard without a token
  if (!token && isDashboardPage) {
    const loginUrl = new URL("/login", request.url);
    // Optional: Store the attempted URL to redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logic B: Redirect to Dashboard if already logged in but trying to access Login page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/repairs", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
