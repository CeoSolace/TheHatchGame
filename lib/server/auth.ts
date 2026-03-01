import jwt from "jsonwebtoken"
import crypto from "crypto"
import type { NextRequest } from "next/server"

const COOKIE = "hatch_session"

function getSecret() {
  return process.env.AUTH_SECRET || ""
}

export function signSession(payload: { userId: string }) {
  const secret = getSecret()
  if (!secret) return null
  return jwt.sign(payload, secret, { expiresIn: "30d" })
}

export function verifySession(token?: string) {
  if (!token) return null
  const secret = getSecret()
  if (!secret) return null
  try {
    return jwt.verify(token, secret) as { userId: string; iat: number; exp: number }
  } catch {
    return null
  }
}

export function getSessionFromReq(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value
  return verifySession(token)
}

// Decide secure cookie based on request headers (works on Render + localhost)
export function sessionCookieOptions(req?: NextRequest) {
  const proto =
    req?.headers.get("x-forwarded-proto") ||
    (typeof window === "undefined" ? "" : window.location.protocol.replace(":", ""))

  const isHttps = proto === "https"

  return {
    httpOnly: true,
    secure: isHttps, // ✅ key fix
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  }
}

export function hashIp(ip: string) {
  return crypto.createHash("sha256").update(ip).digest("hex")
}

export function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return req.headers.get("x-real-ip") || "0.0.0.0"
}
