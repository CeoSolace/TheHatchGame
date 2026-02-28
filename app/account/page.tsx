"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type Me = {
  userId: string
  displayName: string
  avatarUrl: string
  email?: string
  friendCode?: string
  role?: string
} | null

export default function AccountPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get("next") || "/game"

  const [me, setMe] = useState<Me>(null)
  const [loading, setLoading] = useState(true)

  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function loadMe() {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      const data = await res.json()
      setMe(data?.user || null)
    } catch {
      setMe(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMe()
  }, [])

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const body: any = { email, password }
      if (mode === "register") body.displayName = displayName || "Player"

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || "Auth failed")
        return
      }

      await loadMe()
      router.push(next)
    } catch {
      setError("Network error")
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setMe(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Account</h1>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : me ? (
        <div className="border border-gray-700 rounded p-4 space-y-2">
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="text-xl font-semibold">{me.displayName}</p>
          <p className="text-sm text-gray-300 break-all">userId: {me.userId}</p>
          {me.email && <p className="text-sm text-gray-300">email: {me.email}</p>}
          {me.friendCode && <p className="text-sm text-gray-300">friendCode: {me.friendCode}</p>}

          <button onClick={logout} className="btn bg-red-600 hover:bg-red-700 w-full" disabled={busy}>
            Logout
          </button>

          <button onClick={() => router.push("/game")} className="btn w-full" disabled={busy}>
            Go Play
          </button>
        </div>
      ) : (
        <div className="border border-gray-700 rounded p-4 space-y-3">
          <div className="flex gap-2">
            <button
              className={`btn w-full ${mode === "login" ? "" : "bg-gray-700 hover:bg-gray-700"}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`btn w-full ${mode === "register" ? "" : "bg-gray-700 hover:bg-gray-700"}`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <input
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            placeholder="Password (8+ chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          {mode === "register" && (
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              placeholder="Display name (shown in chat)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={24}
            />
          )}

          <button className="btn w-full" onClick={submit} disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
          </button>

          <p className="text-xs text-gray-500">
            Online play requires an account. Offline Hotseat/Troll works without login.
          </p>
        </div>
      )}
    </div>
  )
}
