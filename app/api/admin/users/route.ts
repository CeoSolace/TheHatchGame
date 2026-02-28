import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSession } from "@/lib/server/adminSession"
import { User } from "@/lib/server/models/User"

export async function GET() {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) return new NextResponse("Not found", { status: 404 })
  const token = cookies().get("admin_session")?.value
  const session = getSession(token)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!mongoEnabled()) return NextResponse.json({ ok: true, users: [] })
  await dbConnect()

  const users = await User.find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean()

  return NextResponse.json({
    ok: true,
    users: users.map((u: any) => ({
      userId: String(u._id),
      email: u.email || "",
      displayName: u.displayName || "Player",
      friendCode: u.friendCode || "",
      avatarUrl: u.avatarUrl || "",
      banned: !!u.banned,
      banExpiresAt: u.banExpiresAt ? new Date(u.banExpiresAt).toISOString() : null,
      // counts only; never show values
      deviceCount: Array.isArray(u.deviceIds) ? u.deviceIds.length : 0,
      ipHashCount: Array.isArray(u.ipHashes) ? u.ipHashes.length : 0,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
    })),
  })
}
