import { NextRequest, NextResponse } from "next/server"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSessionFromReq } from "@/lib/server/auth"
import { User } from "@/lib/server/models/User"
import { toPublicUser } from "@/lib/server/publicUser"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ ok: true, user: null })

  await dbConnect()

  const session = getSessionFromReq(req)
  if (!session) return NextResponse.json({ ok: true, user: null })

  // IMPORTANT: findById returns a single doc (not array)
  const user: any = await User.findById(session.userId).lean()
  if (!user) return NextResponse.json({ ok: true, user: null })

  // Public-safe fields + self-only fields
  return NextResponse.json({
    ok: true,
    user: {
      ...toPublicUser(user),
      email: String(user.email || ""),           // self-only
      friendCode: String(user.friendCode || ""), // self-only
      role: String(user.role || "user")
    }
  })
}
