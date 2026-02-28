import { NextRequest, NextResponse } from 'next/server'
import { addReport, listReports, type Report } from '@/lib/server/reportStore'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reportedUserId, category, text, roomId, events } = body

    if (!reportedUserId || !category || !roomId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const report: Report = {
      id: String(Date.now()),
      reportedUserId: String(reportedUserId),
      category: String(category),
      text: String(text || '').slice(0, 500),
      roomId: String(roomId),
      events: Array.isArray(events) ? events.slice(-50) : [],
      createdAt: Date.now(),
      reviewed: false,
    }

    addReport(report)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json(listReports())
}
