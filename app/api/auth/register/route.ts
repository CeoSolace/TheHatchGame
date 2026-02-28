import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { User } from "@/lib/server/models/User"
import { signSession, sessionCookieOptions, getClientIp, hashIp } from "@/lib/server/auth"

function makeFriendCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function POST(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ error: "Mongo disabled" }, { status: 400 })
  await dbConnect()

  const body = await req.json()
  const email = String(body?.email || "").toLowerCase().trim()
  const password = String(body?.password || "")
  const displayName = String(body?.displayName || "Player").slice(0, 24)
  const deviceId = String(body?.deviceId || "")

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid email/password" }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  // friendCode unique retry
  let friendCode = makeFriendCode()
  for (let i = 0; i < 5; i++) {
    const exists = await User.findOne({ friendCode })
    if (!exists) break
    friendCode = makeFriendCode()
  }

  const ip = getClientIp(req)
  const ipHash = hashIp(ip)

  const user = await User.create({
    email,
    passwordHash,
    displayName,
    friendCode,
    deviceIds: deviceId ? [deviceId] : [],
    ipHashes: ipHash ? [ipHash] : [],
  })

  const token = signSession({ userId: String(user._id) })
  const res = NextResponse.json({
    ok: true,
    user: { userId: String(user._id), email, displayName, friendCode, avatarUrl: user.avatarUrl },
  })
  res.cookies.set("hatch_session", token, sessionCookieOptions())
  return res
}
