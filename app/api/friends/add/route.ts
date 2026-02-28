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

  const body = await req.json()
  const code = String(body?.friendCode || "").trim().toUpperCase()
  if (code.length !== 8) return NextResponse.json({ error: "Invalid friend code" }, { status: 400 })

  const me = await User.findById(session.userId)
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const other = await User.findOne({ friendCode: code })
  if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (String(other._id) === String(me._id)) return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 })

  // If either direction is blocked, prevent
  const existing1 = await Friendship.findOne({ fromUserId: me._id, toUserId: other._id })
  const existing2 = await Friendship.findOne({ fromUserId: other._id, toUserId: me._id })
  if (existing1?.status === "blocked" || existing2?.status === "blocked") {
    return NextResponse.json({ error: "Blocked" }, { status: 403 })
  }

  await Friendship.updateOne(
    { fromUserId: me._id, toUserId: other._id },
    { $setOnInsert: { fromUserId: me._id, toUserId: other._id, status: "pending", createdAt: new Date() }, $set: { updatedAt: new Date() } },
    { upsert: true }
  )

  return NextResponse.json({ ok: true })
}
