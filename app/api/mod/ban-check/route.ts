import { NextRequest, NextResponse } from "next/server"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSessionFromReq } from "@/lib/server/auth"
import { User } from "@/lib/server/models/User"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ ok: true, banned: false })

  await dbConnect()

  const session = getSessionFromReq(req)
  if (!session) return NextResponse.json({ ok: true, banned: false })

  // IMPORTANT: findById returns a single doc, lean gives plain object
  const user: any = await User.findById(session.userId).lean()
  if (!user) return NextResponse.json({ ok: true, banned: false })

  const now = new Date()
  const banned = !!user.banned && (!user.banExpiresAt || new Date(user.banExpiresAt) > now)

  // privacy: minimal response only
  return NextResponse.json({ ok: true, banned })
}
