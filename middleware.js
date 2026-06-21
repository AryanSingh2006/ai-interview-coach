import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/interview"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  // Note: this only checks the cookie EXISTS, not that it's valid.
  // Full signature/expiry verification happens server-side in route
  // handlers via getCurrentUser(), where Node's crypto is available.
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/interview/:path*"],
};