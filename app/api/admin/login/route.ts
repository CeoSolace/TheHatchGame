import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createSession, clearSession } from '@/lib/server/adminSession'

function safeCompare(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export async function POST(req: NextRequest) {
  const adminUser = process.env.ADMIN_USER
  const adminPass = process.env.ADMIN_PASS

  if (!adminUser || !adminPass) {
    return new NextResponse('Admin disabled', { status: 404 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const username = String(body?.username ?? '')
  const password = String(body?.password ?? '')

  const ok = safeCompare(username, adminUser) && safeCompare(password, adminPass)
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const session = createSession()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  })
  return res
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value
  if (token) clearSession(token)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', '', { expires: new Date(0), path: '/' })
  return res
}
