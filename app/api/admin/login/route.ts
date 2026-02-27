import { NextRequest, NextResponse } from 'next/server'
import secureCompare from 'secure-compare'
import { createSession, getSession, clearSession } from '@/lib/server/adminSession'

export async function POST(req: NextRequest) {
  const adminUser = process.env.ADMIN_USER
  const adminPass = process.env.ADMIN_PASS
  if (!adminUser || !adminPass) {
    return new NextResponse('Admin disabled', { status: 404 })
  }
  const { username, password } = await req.json()
  if (
    secureCompare(username || '', adminUser) &&
    secureCompare(password || '', adminPass)
  ) {
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
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value
  if (token) clearSession(token)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', '', { expires: new Date(0), path: '/' })
  return res
}