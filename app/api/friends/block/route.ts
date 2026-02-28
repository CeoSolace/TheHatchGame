import { NextRequest, NextResponse } from "next/server"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSessionFromReq } from "@/lib/server/auth"
import { User } from "@/lib/server/models/User"
import { Friendship } from "@/lib/server/models/Friendship"

export async function POST(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ error: "Mongo disabled" }, { status: 400 })
  await dbConnect()

  const session = getSessionFromReq(req)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userId } = await req.json()
  const otherId = String(userId || "")
  if (!otherId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

  const me = await User.findById(session.userId)
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await Friendship.deleteOne({ fromUserId: me._id, toUserId: otherId })
  await Friendship.deleteOne({ fromUserId: otherId, toUserId: me._id })

  return NextResponse.json({ ok: true })
}
