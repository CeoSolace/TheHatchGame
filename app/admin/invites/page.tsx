"use client"
import { useEffect, useState } from 'react'

interface Invite {
  id: string
  token: string
  slug?: string
  createdAt: number
  revoked: boolean
}

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [slug, setSlug] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/admin/invites')
    if (res.ok) {
      const data = await res.json()
      setInvites(data)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function create() {
    setError(null)
    const res = await fetch('/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slug || undefined }),
    })
    if (res.ok) {
      setSlug('')
      load()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create invite')
    }
  }
  async function revoke(token: string) {
    await fetch('/api/admin/invites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    load()
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Org Owner Invites</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex gap-2">
        <input
          placeholder="Optional preset slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700 flex-grow"
        />
        <button onClick={create} className="btn">Create Invite</button>
      </div>
      <table className="min-w-full table-auto text-sm border border-gray-700">
        <thead>
          <tr className="bg-gray-800 text-gray-200">
            <th className="border px-2 py-1">Token</th>
            <th className="border px-2 py-1">Slug</th>
            <th className="border px-2 py-1">Created</th>
            <th className="border px-2 py-1">Revoked</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((inv) => (
            <tr key={inv.token}>
              <td className="border px-2 py-1 break-all">{inv.token.slice(0, 8)}…</td>
              <td className="border px-2 py-1">{inv.slug || '—'}</td>
              <td className="border px-2 py-1">{new Date(inv.createdAt).toLocaleDateString()}</td>
              <td className="border px-2 py-1">{inv.revoked ? 'Yes' : 'No'}</td>
              <td className="border px-2 py-1">
                {!inv.revoked && (
                  <button onClick={() => revoke(inv.token)} className="btn text-xs bg-red-600 hover:bg-red-700">
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}