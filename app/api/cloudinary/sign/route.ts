import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Uploads disabled' }, { status: 404 })
  }
  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = `timestamp=${timestamp}`
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex')
  return NextResponse.json({ timestamp, signature, apiKey, cloudName })
}