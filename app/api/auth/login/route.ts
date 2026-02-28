import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { User } from "@/lib/server/models/User"
import { signSession, sessionCookieOptions, getClientIp, hashIp } from "@/lib/server/auth"

export async function POST(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ error: "Mongo disabled" }, { status: 400 })
  await dbConnect()

  const body = await req.json()
  const email = String(body?.email || "").toLowerCase().trim()
  const password = String(body?.password || "")
  const deviceId = String(body?.deviceId || "")

  const user = await User.findOne({ email })
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  // ban check
  const now = new Date()
  if (user.banned && (!user.banExpiresAt || user.banExpiresAt > now)) {
    return NextResponse.json({ error: "Banned", reason: user.banReason || "" }, { status: 403 })
  }

  const ok = await bcrypt.compare(password, user.passwordHash || "")
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const ipHash = hashIp(getClientIp(req))
  const updates: any = {}
  if (deviceId && !user.deviceIds.includes(deviceId)) updates.$addToSet = { deviceIds: deviceId }
  if (ipHash && !user.ipHashes.includes(ipHash)) {
    updates.$addToSet = { ...(updates.$addToSet || {}), ipHashes: ipHash }
  }
  if (Object.keys(updates).length) await User.updateOne({ _id: user._id }, updates)

  const token = signSession({ userId: String(user._id) })
  const res = NextResponse.json({
    ok: true,
    user: {
      userId: String(user._id),
      email: user.email,
      displayName: user.displayName,
      friendCode: user.friendCode,
      avatarUrl: user.avatarUrl,
    },
  })
  res.cookies.set("hatch_session", token, sessionCookieOptions())
  return res
}
