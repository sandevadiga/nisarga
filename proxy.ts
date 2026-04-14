import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const publicRoutes = ["/login"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const token = req.cookies.get("session")?.value;
  const session = await decrypt(token);

  // Not authenticated → send to login (except public routes)
  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Authenticated on public route → redirect to their dashboard
  if (isPublicRoute && session?.userId) {
    const dest = session.role === "ADMIN" ? "/admin" : "/manager";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  // Role-based protection
  if (session?.userId) {
    if (path.startsWith("/admin") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/manager", req.nextUrl));
    }
    if (path.startsWith("/manager") && session.role !== "MANAGER") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)"],
};
