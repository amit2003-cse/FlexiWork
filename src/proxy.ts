import middleware from "next-auth/middleware";
import type { NextRequest, NextFetchEvent } from "next/server";

export function proxy(req: NextRequest, event: NextFetchEvent) {
  return (middleware as any)(req, event);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/jobs/post/:path*",
  ],
};
