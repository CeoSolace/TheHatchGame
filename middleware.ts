import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession } from "@/lib/server/auth"

const COOKIE = "hatch_session"

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Only guard gameplay routes
  if (!pathname.startsWith("/game")) return NextResponse.next()

  // Allow offline local play without auth
  if (pathname === "/game/offline" || pathname.startsWith("/game/offline/")) {
    return NextResponse.next()
  }

  // If Mongo is missing, online accounts can't work; force offline info page
  if (!process.env.MONGO_URI) {
    const url = req.nextUrl.clone()
    url.pathname = "/offline"
    return NextResponse.redirect(url)
  }

  // Require session cookie
  const token = req.cookies.get(COOKIE)?.value
  const session = verifySession(token)
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = "/account"
    url.searchParams.set("next", `${pathname}${search || ""}`)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/game/:path*"],
}
