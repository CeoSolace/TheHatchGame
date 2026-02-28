import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/server/db"
import { getSessionFromReq } from "@/lib/server/auth"
import { User } from "@/lib/server/models/User"
import { toPublicUser } from "@/lib/server/publicUser"

export async function GET(req: NextRequest) {
  await dbConnect()

  const session = getSessionFromReq(req)
  if (!session) {
    return NextResponse.json({ ok: true, user: null })
  }

  const user = await User.findById(session.userId)
  if (!user) {
    return NextResponse.json({ ok: true, user: null })
  }

  return NextResponse.json({
    ok: true,
    user: {
      ...toPublicUser(user),
      email: user.email,            // only visible to self
      friendCode: user.friendCode,  // only visible to self
      role: user.role,
    },
  })
}
