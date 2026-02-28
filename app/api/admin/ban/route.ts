import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSession } from "@/lib/server/adminSession"
import { User } from "@/lib/server/models/User"

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) return new NextResponse("Not found", { status: 404 })
  const token = cookies().get("admin_session")?.value
  const session = getSession(token)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!mongoEnabled()) return NextResponse.json({ error: "Mongo disabled" }, { status: 400 })
  await dbConnect()

  const body = await req.json()
  const userId = String(body?.userId || "")
  const reason = String(body?.reason || "").slice(0, 200)
  const expiresAt = body?.expiresAt ? new Date(String(body.expiresAt)) : null

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

  await User.updateOne(
    { _id: userId },
    { $set: { banned: true, banReason: reason, banExpiresAt: expiresAt } }
  )

  return NextResponse.json({ ok: true })
}
