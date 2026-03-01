import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { User } from "@/lib/server/models/User"
import { signSession, sessionCookieOptions } from "@/lib/server/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ error: "Accounts disabled" }, { status: 400 })
  await dbConnect()

  const body = await req.json()
  const email = String(body?.email || "").toLowerCase().trim()
  const password = String(body?.password || "")

  const user: any = await User.findOne({ email }).lean()
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const ok = await bcrypt.compare(password, String(user.passwordHash || ""))
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const token = signSession({ userId: String(user._id) })
  if (!token) return NextResponse.json({ error: "AUTH_SECRET missing" }, { status: 500 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set("hatch_session", token, sessionCookieOptions(req)) // ✅ pass req
  return res
}
