import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/server/adminSession'
import { markReviewed, dismiss, getReport } from '@/lib/server/reportStore'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, action } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const exists = getReport(String(id))
  if (!exists) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  if (action === 'reviewed') markReviewed(String(id))
  else if (action === 'dismiss') dismiss(String(id))
  else return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  return NextResponse.json({ ok: true })
}
