import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSession } from "@/lib/server/adminSession"
import { User } from "@/lib/server/models/User"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const token = cookies().get("admin_session")?.value
  const session = getSession(token)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!mongoEnabled()) return NextResponse.json({ error: "Mongo disabled" }, { status: 400 })
  await dbConnect()

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const userId = String(body?.userId || "")
  const reason = String(body?.reason || "").slice(0, 200)
  const expiresAtRaw = body?.expiresAt ? String(body.expiresAt) : ""
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

  await User.updateOne(
    { _id: userId },
    { $set: { banned: true, banReason: reason, banExpiresAt: expiresAt } }
  )

  return NextResponse.json({ ok: true })
}