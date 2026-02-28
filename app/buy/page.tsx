"use client"

import { useEffect, useState } from "react"

export default function BuyPage() {
  const [offline, setOffline] = useState(false)
  const [donateLink, setDonateLink] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setOffline(!navigator.onLine)

    const onOff = () => setOffline(true)
    const onOn = () => setOffline(false)
    window.addEventListener("offline", onOff)
    window.addEventListener("online", onOn)

    ;(async () => {
      try {
        const res = await fetch("/api/config", { cache: "no-store" })
        const data = await res.json()
        setDonateLink(String(data?.stripeDonoLink || ""))
      } catch {
        setDonateLink("")
      } finally {
        setLoading(false)
      }
    })()

    return () => {
      window.removeEventListener("offline", onOff)
      window.removeEventListener("online", onOn)
    }
  }, [])

  const disabled = offline || !donateLink

  return (
    <div className="space-y-6 max-w-prose mx-auto">
      <h1 className="text-3xl font-bold">Support THE HATCH</h1>

      <p className="text-gray-300">
        Donations help keep servers running and fund the roadmap. Donations are processed by Stripe.
      </p>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : disabled ? (
        <p className="text-yellow-400">
          Donations are currently unavailable{offline ? " (offline)" : " (STRIPE_DONO_LINK missing)"}.
        </p>
      ) : (
        <a href={donateLink} className="btn inline-block" target="_blank" rel="noopener noreferrer">
          Donate via Stripe
        </a>
      )}

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Roadmap</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-300">
          <li>Version 1 online + offline</li>
          <li>Version 2 Escalation Edition</li>
          <li>Teams + tournaments</li>
          <li>PWA polish + native wrappers</li>
        </ul>
      </div>
    </div>
  )
}
