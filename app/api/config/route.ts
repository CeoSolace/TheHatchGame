import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    stripeDonoLink: process.env.STRIPE_DONO_LINK || "",
  })
}
