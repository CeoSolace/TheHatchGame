import jwt from "jsonwebtoken"
import crypto from "crypto"
import type { NextRequest } from "next/server"

const COOKIE = "hatch_session"

export function signSession(payload: { userId: string }) {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET missing")
  return jwt.sign(payload, secret, { expiresIn: "30d" })
}

export function verifySession(token?: string) {
  if (!token) return null
  const secret = process.env.AUTH_SECRET
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

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  }
}

// privacy-safe: store only a hash of IP, not raw
export function hashIp(ip: string) {
  return crypto.createHash("sha256").update(ip).digest("hex")
}

export function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return req.headers.get("x-real-ip") || "0.0.0.0"
}
