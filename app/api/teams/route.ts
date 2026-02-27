import { NextRequest, NextResponse } from 'next/server'
import { teams } from '@/lib/data/teams'

export async function GET(req: NextRequest) {
  return NextResponse.json(teams)
}