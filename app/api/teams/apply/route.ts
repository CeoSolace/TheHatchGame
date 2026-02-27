import { NextRequest, NextResponse } from 'next/server'

interface Application {
  id: string
  slug: string
  name: string
  description: string
  createdAt: number
  status: 'pending' | 'approved' | 'rejected'
}

// In‑memory applications. In production this would be persisted to MongoDB.
const pending: Application[] = []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, name, description } = body
    if (!slug || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const app: Application = {
      id: String(Date.now()),
      slug,
      name,
      description,
      createdAt: Date.now(),
      status: 'pending',
    }
    pending.push(app)
    return NextResponse.json({ ok: true, application: app })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}