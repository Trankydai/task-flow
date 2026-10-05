import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/tasks"];
const authPages = ["/login", "/register"];
const sessionCookieName = "taskflow_user_id";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const session = request.cookies.get(sessionCookieName);

  if (isProtected && !session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authPages.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/login", "/register"]
};
