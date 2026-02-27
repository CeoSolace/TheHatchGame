import { NextRequest, NextResponse } from 'next/server'

interface Report {
  id: string
  reportedUserId: string
  category: string
  text: string
  roomId: string
  events: any[]
  createdAt: number
  reviewed: boolean
}

export const reports: Report[] = []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reportedUserId, category, text, roomId, events } = body
    if (!reportedUserId || !category || !roomId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const report: Report = {
      id: String(Date.now()),
      reportedUserId,
      category,
      text: (text || '').slice(0, 500),
      roomId,
      events: Array.isArray(events) ? events.slice(-50) : [],
      createdAt: Date.now(),
      reviewed: false,
    }
    reports.push(report)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  // Only admin should access; simple check using query token or cookie is omitted in this sample
  return NextResponse.json(reports)
}