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

  const { fromUserId, action } = await req.json()
  const fromId = String(fromUserId || "")
  if (!fromId) return NextResponse.json({ error: "Missing fromUserId" }, { status: 400 })
  if (action !== "accept" && action !== "decline") return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  const me = await User.findById(session.userId)
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const incoming = await Friendship.findOne({ fromUserId: fromId, toUserId: me._id, status: "pending" })
  if (!incoming) return NextResponse.json({ error: "Request not found" }, { status: 404 })

  incoming.status = action === "accept" ? "accepted" : "declined"
  incoming.updatedAt = new Date()
  await incoming.save()

  return NextResponse.json({ ok: true })
}
