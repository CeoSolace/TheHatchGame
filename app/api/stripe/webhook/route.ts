import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { dbConnect } from "@/lib/server/db"
import { Subscription } from "@/lib/server/models/Subscription"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY
  const whsec = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !whsec) return NextResponse.json({ error: "Webhook disabled" }, { status: 400 })

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" })

  const sig = req.headers.get("stripe-signature")
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, whsec)
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 })
  }

  await dbConnect()

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.userId
    if (userId) {
      await Subscription.updateOne(
        { userId },
        {
          $set: {
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.userId
    if (userId) {
      await Subscription.updateOne(
        { userId },
        { $set: { status: "canceled", updatedAt: new Date() } },
        { upsert: true }
      )
    }
  }

  return NextResponse.json({ received: true })
}
