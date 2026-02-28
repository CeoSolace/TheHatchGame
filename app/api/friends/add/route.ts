import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/server/db"
import { getSessionFromReq } from "@/lib/server/auth"
import { User } from "@/lib/server/models/User"
import { Friendship } from "@/lib/server/models/Friendship"

export async function POST(req: NextRequest) {
  await dbConnect()
  const session = getSessionFromReq(req)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { friendCode } = await req.json()
  const code = String(friendCode || "").trim().toUpperCase()
  if (code.length !== 8) return NextResponse.json({ error: "Invalid friend code" }, { status: 400 })

  const me = await User.findById(session.userId)
  const other = await User.findOne({ friendCode: code })
  if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (String(other._id) === String(me._id)) return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 })

  await Friendship.updateOne(
    { fromUserId: me._id, toUserId: other._id },
    { $setOnInsert: { fromUserId: me._id, toUserId: other._id, status: "pending" } },
    { upsert: true }
  )

  return NextResponse.json({ ok: true })
}
