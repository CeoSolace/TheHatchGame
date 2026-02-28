import { NextRequest, NextResponse } from "next/server"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSessionFromReq } from "@/lib/server/auth"
import { User } from "@/lib/server/models/User"

export async function GET(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ ok: true, banned: false })
  await dbConnect()

  const session = getSessionFromReq(req)
  if (!session) return NextResponse.json({ ok: true, banned: false })

  const user = await User.findById(session.userId).lean()
  if (!user) return NextResponse.json({ ok: true, banned: false })

  const now = new Date()
  const banned = !!user.banned && (!user.banExpiresAt || user.banExpiresAt > now)

  // DO NOT return reason/device/ip; keep minimal
  return NextResponse.json({ ok: true, banned })
}
