import { NextRequest, NextResponse } from "next/server"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSessionFromReq } from "@/lib/server/auth"
import { User } from "@/lib/server/models/User"
import { Friendship } from "@/lib/server/models/Friendship"
import { toPublicUser } from "@/lib/server/publicUser"

export async function GET(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ ok: true, friends: [], incoming: [], outgoing: [] })
  await dbConnect()

  const session = getSessionFromReq(req)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await User.findById(session.userId)
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const outgoing = await Friendship.find({ fromUserId: me._id, status: "pending" }).lean()
  const incoming = await Friendship.find({ toUserId: me._id, status: "pending" }).lean()
  const acceptedA = await Friendship.find({ fromUserId: me._id, status: "accepted" }).lean()
  const acceptedB = await Friendship.find({ toUserId: me._id, status: "accepted" }).lean()

  const outgoingIds = outgoing.map((f: any) => String(f.toUserId))
  const incomingIds = incoming.map((f: any) => String(f.fromUserId))
  const friendIds = [...acceptedA.map((f: any) => String(f.toUserId)), ...acceptedB.map((f: any) => String(f.fromUserId))]

  const users = await User.find({ _id: { $in: [...outgoingIds, ...incomingIds, ...friendIds] } }).lean()
  const byId = new Map(users.map((u: any) => [String(u._id), u]))

  return NextResponse.json({
    ok: true,
    outgoing: outgoingIds.map((id) => ({ user: toPublicUser(byId.get(id)), status: "pending" })),
    incoming: incomingIds.map((id) => ({ user: toPublicUser(byId.get(id)), status: "pending" })),
    friends: friendIds.map((id) => ({ user: toPublicUser(byId.get(id)), status: "accepted" })),
  })
}
