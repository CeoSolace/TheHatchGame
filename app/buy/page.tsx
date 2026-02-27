"use client"
import { useState, useEffect } from 'react'

export default function BuyPage() {
  const [offline, setOffline] = useState(false)
  useEffect(() => {
    setOffline(!navigator.onLine)
    const onOff = () => setOffline(true)
    const onOn = () => setOffline(false)
    window.addEventListener('offline', onOff)
    window.addEventListener('online', onOn)
    return () => {
      window.removeEventListener('offline', onOff)
      window.removeEventListener('online', onOn)
    }
  }, [])
  const donateLink = process.env.NEXT_PUBLIC_STRIPE_DONO_LINK || process.env.STRIPE_DONO_LINK || ''
  return (
    <div className="space-y-6 max-w-prose mx-auto">
      <h1 className="text-3xl font-bold">Support THE HATCH</h1>
      <p>
        We’re an independent studio building THE HATCH out of passion. Your
        support helps us continue development, maintain servers and add new
        features like Version 2: Escalation Edition. All donations are handled
        securely via Stripe.
      </p>
      {donateLink && !offline ? (
        <a
          href={donateLink}
          className="btn inline-block"
          target="_blank"
          rel="noopener noreferrer"
        >
          Donate via Stripe
        </a>
      ) : (
        <p className="text-yellow-400">
          Donations are currently unavailable{!donateLink ? ' (link missing)' : ' (offline)'}.
        </p>
      )}
      <h2 className="text-2xl font-bold">Roadmap</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Version 1 launch with online multiplayer and offline hotseat</li>
        <li>Version 2: Escalation Edition ruleset and chaos events</li>
        <li>Team pages and community tournaments</li>
        <li>PWA improvements and cross‑platform native apps</li>
      </ul>
    </div>
  )
}