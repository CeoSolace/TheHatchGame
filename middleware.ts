import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Only guard /game
  if (!pathname.startsWith("/game")) {
    return NextResponse.next()
  }

  // Allow offline mode
  if (pathname.startsWith("/game/offline")) {
    return NextResponse.next()
  }

  // Just check cookie exists (DO NOT verify JWT in middleware)
  const token = req.cookies.get("hatch_session")?.value

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/account"
    url.searchParams.set("next", pathname + search)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/game/:path*"],
}
