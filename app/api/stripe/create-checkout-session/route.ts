import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { dbConnect, mongoEnabled } from "@/lib/server/db"
import { getSessionFromReq } from "@/lib/server/auth"
import { User } from "@/lib/server/models/User"
import { Subscription } from "@/lib/server/models/Subscription"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  if (!mongoEnabled()) return NextResponse.json({ error: "Mongo disabled" }, { status: 400 })

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return NextResponse.json({ error: "Stripe disabled" }, { status: 400 })

  await dbConnect()

  const session = getSessionFromReq(req)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const priceId = String(body?.priceId || "")
  if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 })

  const user = await User.findById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" })

  let subRow = await Subscription.findOne({ userId: user._id })
  let customerId = subRow?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email || undefined })
    customerId = customer.id
  }

  const origin = req.headers.get("origin") || "https://thehatch.store"

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/account?sub=success`,
    cancel_url: `${origin}/account?sub=cancel`,
    metadata: { userId: String(user._id) }
  })

  await Subscription.updateOne(
    { userId: user._id },
    {
      $set: {
        userId: user._id,
        stripeCustomerId: customerId,
        priceId,
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  )

  return NextResponse.json({ ok: true, url: checkout.url })
}
