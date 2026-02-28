"use client"

import { useEffect, useState } from "react"

type AdminUserRow = {
  userId: string
  email: string
  displayName: string
  friendCode: string
  avatarUrl: string
  banned: boolean
  banExpiresAt: string | null
  deviceCount: number
  ipHashCount: number
  createdAt: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState<string>("")

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" })
      const data = await res.json()
      setUsers(Array.isArray(data?.users) ? data.users : [])
    } catch {
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function ban(userId: string) {
    await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason }),
    })
    load()
  }

  async function unban(userId: string) {
    await fetch("/api/admin/unban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="border border-gray-700 rounded p-3 space-y-2">
        <p className="text-sm text-gray-300">
          Privacy: this panel shows <b>counts only</b> for device/ip hashes. Raw identifiers are never displayed.
        </p>
        <input
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          placeholder="Ban reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p className="text-gray-400">Loading…</p>}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left p-2 border-b border-gray-700">User</th>
                <th className="text-left p-2 border-b border-gray-700">Email</th>
                <th className="text-left p-2 border-b border-gray-700">FriendCode</th>
                <th className="text-left p-2 border-b border-gray-700">Status</th>
                <th className="text-left p-2 border-b border-gray-700">Counts</th>
                <th className="text-left p-2 border-b border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId} className="border-t border-gray-800">
                  <td className="p-2">
                    <div className="font-semibold">{u.displayName}</div>
                    <div className="text-xs text-gray-400">userId: {u.userId}</div>
                  </td>
                  <td className="p-2">{u.email || <span className="text-gray-500">—</span>}</td>
                  <td className="p-2">{u.friendCode || <span className="text-gray-500">—</span>}</td>
                  <td className="p-2">
                    {u.banned ? (
                      <span className="text-red-400">Banned</span>
                    ) : (
                      <span className="text-green-400">Active</span>
                    )}
                    {u.banExpiresAt && <div className="text-xs text-gray-400">until {new Date(u.banExpiresAt).toLocaleString()}</div>}
                  </td>
                  <td className="p-2 text-xs text-gray-300">
                    <div>devices: {u.deviceCount}</div>
                    <div>ip hashes: {u.ipHashCount}</div>
                  </td>
                  <td className="p-2">
                    {u.banned ? (
                      <button className="btn bg-green-600 hover:bg-green-700 text-xs" onClick={() => unban(u.userId)}>
                        Unban
                      </button>
                    ) : (
                      <button className="btn bg-red-600 hover:bg-red-700 text-xs" onClick={() => ban(u.userId)}>
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="p-2 text-gray-400" colSpan={6}>
                    No users found (or Mongo disabled).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
