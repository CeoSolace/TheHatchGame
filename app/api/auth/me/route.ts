import { NextRequest, NextResponse } from "next/server"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSessionFromReq } from "@/lib/server/auth"
import { User } from "@/lib/server/models/User"

export async function GET(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ ok: true, user: null })
  await dbConnect()
  const session = getSessionFromReq(req)
  if (!session) return NextResponse.json({ ok: true, user: null })

  const user = await User.findById(session.userId).lean()
  if (!user) return NextResponse.json({ ok: true, user: null })

  return NextResponse.json({
    ok: true,
    user: {
      userId: String(user._id),
      email: user.email,
      displayName: user.displayName,
      friendCode: user.friendCode,
      avatarUrl: user.avatarUrl,
      role: user.role,
    },
  })
}
