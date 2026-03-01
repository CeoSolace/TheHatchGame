"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import FundingBanner from "./components/FundingBanner"
import { PlayerCard } from "./components/PlayerCard"
import { PressureMeter } from "./components/PressureMeter"
import { DiceVisual } from "./components/DiceVisual"
import { Icon } from "./components/Icon"

import WebGLGate from "./components3d/WebGLGate"
import GameScene3D from "./components3d/GameScene3D"

type Me = {
  userId: string
  displayName: string
  avatarUrl: string
  email?: string
  friendCode?: string
  role?: string
} | null

type Seat = {
  userId: string
  displayName: string
  hearts: number
  cowardTokens: number
  isHost?: boolean
  isTurn?: boolean
}

function HatchBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-48 -right-48 h-[620px] w-[620px] rounded-full bg-white/5 blur-3xl" />

      <svg
        className="absolute left-1/2 top-24 -translate-x-1/2 opacity-[0.06]"
        width="520"
        height="520"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 3c5 0 9 4 9 9 0 4.2-2.8 7.8-6.7 8.8-.9-1.8-2.4-3.3-4.3-4.1-1.9.8-3.4 2.3-4.3 4.1C5.8 19.8 3 16.2 3 12c0-5 4-9 9-9z"
          stroke="white"
          strokeWidth="1.4"
        />
        <path d="M8 13c1.2-1 2.6-1.5 4-1.5S14.8 12 16 13" stroke="white" strokeWidth="1.4" />
      </svg>
    </div>
  )
}

function ModeCard({
  title,
  desc,
  href,
  icon,
  disabled,
  badge,
}: {
  title: string
  desc: string
  href: string
  icon: Parameters<typeof Icon>[0]["name"]
  disabled?: boolean
  badge?: string
}) {
  const body = (
    <div
      className={[
        "rounded-2xl border p-4 bg-white/5 transition",
        disabled ? "border-white/10 opacity-60" : "border-white/10 hover:border-white/20 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-white/10 bg-black/20 p-2">
          <Icon name={icon} className="w-5 h-5 text-white/80" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{title}</div>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/70">
                {badge}
              </span>
            )}
          </div>
          <div className="text-sm text-white/65 mt-1">{desc}</div>
        </div>
      </div>
    </div>
  )

  if (disabled) return body
  return (
    <Link href={href} className="block">
      {body}
    </Link>
  )
}

export default function GameLobbyPage() {
  const donateLink = process.env.NEXT_PUBLIC_STRIPE_DONO_LINK

  const [me, setMe] = useState<Me>(null)
  const [loadingMe, setLoadingMe] = useState(true)
  const [offline, setOffline] = useState(false)

  // Cosmetic demo values (until socket state is wired in)
  const [pressure, setPressure] = useState(0)
  const [lastRoll, setLastRoll] = useState(5)

  useEffect(() => {
    const update = () => setOffline(typeof navigator !== "undefined" ? !navigator.onLine : false)
    update()
    window.addEventListener("offline", update)
    window.addEventListener("online", update)
    return () => {
      window.removeEventListener("offline", update)
      window.removeEventListener("online", update)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        const data = await res.json()
        if (!mounted) return
        setMe(data?.user || null)
      } catch {
        if (!mounted) return
        setMe(null)
      } finally {
        if (!mounted) return
        setLoadingMe(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // UI-only motion so the lobby feels alive
  useEffect(() => {
    const t = window.setInterval(() => {
      setLastRoll((v) => (v >= 6 ? 1 : v + 1))
      setPressure((p) => (p >= 10 ? 0 : p + 1))
    }, 2200)
    return () => window.clearInterval(t)
  }, [])

  const seats: Seat[] = useMemo(() => {
    return [
      {
        userId: me?.userId || "guest",
        displayName: me?.displayName || "You",
        hearts: 3,
        cowardTokens: 0,
        isHost: true,
        isTurn: true,
      },
      { userId: "seat-2", displayName: "Player 2", hearts: 3, cowardTokens: 1 },
      { userId: "seat-3", displayName: "Player 3", hearts: 2, cowardTokens: 2 },
      { userId: "seat-4", displayName: "Player 4", hearts: 4, cowardTokens: 0 },
    ]
  }, [me?.displayName, me?.userId])

  const turnIndex = Math.max(0, seats.findIndex((s) => s.isTurn))

  return (
    <div className="relative">
      <HatchBackdrop />

      <div className="relative space-y-6">
        {/* Funding message */}
        <FundingBanner donateLink={!offline ? donateLink : undefined} />

        {/* Header strip */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Icon name="hatch" className="w-5 h-5 text-white/80" />
                <h1 className="text-xl font-semibold">Play</h1>
                {offline && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-200">
                    Offline Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 mt-1">
                Visuals are <span className="text-white/80">code-generated placeholders</span> until we fund a full custom art pass.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="text-xs text-white/50">Signed in</div>
                <div className="text-sm font-semibold">{loadingMe ? "…" : me ? me.displayName : "Guest"}</div>
              </div>

              {!me && !offline && (
                <Link
                  href="/account?next=/game"
                  className="rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 px-3 py-2 text-sm font-semibold"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main “game-feeling” panel */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/80">Table Preview</div>
              <div className="text-xs text-white/50">Procedural 3D + UI</div>
            </div>

            {/* 3D layer */}
            <WebGLGate>
              <GameScene3D
                players={seats.map((s) => ({
                  userId: s.userId,
                  displayName: s.displayName,
                  hearts: s.hearts,
                  cowardTokens: s.cowardTokens,
                  isHost: s.isHost,
                }))}
                turnIndex={turnIndex}
                lastRoll={lastRoll}
              />
              <div className="mt-2 text-xs text-white/45">
                3D visuals are procedural placeholders until the art fund covers real models + textures.
              </div>
            </WebGLGate>

            {/* UI layer */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <PressureMeter pressure={pressure} />
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50 mb-2">Dice Preview</div>
                  <DiceVisual value={lastRoll} />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {seats.map((s) => (
                  <PlayerCard
                    key={s.userId}
                    displayName={s.displayName}
                    userId={s.userId}
                    hearts={s.hearts}
                    cowardTokens={s.cowardTokens}
                    isHost={s.isHost}
                    isTurn={s.isTurn}
                  />
                ))}
              </div>

              <div className="mt-4 text-xs text-white/45">
                This lobby preview is UI-only. Online matches will render real state + animations as funding expands.
              </div>
            </div>
          </div>

          {/* Modes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/80">Modes</div>
              <div className="text-xs text-white/50">Offline always works</div>
            </div>

            <div className="grid gap-3">
              <ModeCard
                title="Offline Hotseat"
                desc="Play locally on one device. Works offline and installable as a PWA."
                href="/game/offline"
                icon="shield"
                badge="Offline"
              />

              <ModeCard
                title="Offline Troll Mode"
                desc="Private local mode with troll actions (no gameplay manipulation)."
                href="/game/offline?troll=1"
                icon="warning"
                badge="Offline"
              />

              <ModeCard
                title="Online Play"
                desc={offline ? "Disabled while offline." : me ? "Create/join rooms, friends-only, or matchmaking." : "Sign in required for online play."}
                href="/game/online"
                icon="chat"
                disabled={offline || !me}
                badge={offline ? "Offline" : !me ? "Sign in" : "Online"}
              />

              <Link
                href="/versions"
                className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition block"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Rules / Versions</div>
                    <div className="text-sm text-white/65 mt-1">Printable rules for Version 1 + Version 2 text.</div>
                  </div>
                  <Icon name="dice" className="w-5 h-5 text-white/70" />
                </div>
              </Link>
            </div>

            <div className="text-xs text-white/40">
              Online features require an account. Offline Hotseat/Troll remain playable without login.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}