import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/server/adminSession'
import { createInvite, listInvites, revokeInvite } from '@/lib/server/invites'

async function authenticate() {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = getSession(token)
  return !!session
}

export async function GET(req: NextRequest) {
  if (!(await authenticate())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(listInvites())
}

export async function POST(req: NextRequest) {
  if (!(await authenticate())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { slug } = body
  const invite = createInvite(slug)
  return NextResponse.json(invite)
}

export async function DELETE(req: NextRequest) {
  if (!(await authenticate())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { token } = body
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  revokeInvite(token)
  return NextResponse.json({ ok: true })
}