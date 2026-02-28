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

    // NOTE: If MongoDB is configured later, this is where you’d write to Mongo.
    // For now (and when MONGO_URI is missing) we store in-memory.
    addReport(report)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  // Public GET isn't ideal for production, but keeping it as-is for now since admin UI uses it.
  // If you want: lock this behind admin session check.
  return NextResponse.json(listReports())
}
