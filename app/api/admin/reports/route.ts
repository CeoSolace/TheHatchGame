import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server/adminSession'
import { cookies } from 'next/headers'
import { reports as userReports } from '@/app/api/reports/route'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = getSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, action } = body
  const report = userReports.find((r) => r.id === id)
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  if (action === 'reviewed') report.reviewed = true
  if (action === 'dismiss') report.reviewed = true
  return NextResponse.json({ ok: true })
}