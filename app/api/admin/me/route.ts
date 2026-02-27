import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server/adminSession'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value
  const session = getSession(token)
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true })
}