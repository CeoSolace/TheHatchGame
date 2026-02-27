"use client"
import { useState } from 'react'
import { teams } from '@/lib/data/teams'

export default function AdminTeamsPage() {
  const [localTeams, setLocalTeams] = useState([...teams])
  function toggleVerified(slug: string) {
    setLocalTeams((prev) => prev.map((t) => (t.slug === slug ? { ...t, verified: !t.verified } : t)))
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Teams Management</h2>
      {localTeams.length === 0 && <p>No teams.</p>}
      <table className="min-w-full table-auto text-sm border border-gray-700">
        <thead>
          <tr className="bg-gray-800 text-gray-200">
            <th className="border px-2 py-1">Slug</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Verified</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {localTeams.map((team) => (
            <tr key={team.slug}>
              <td className="border px-2 py-1">{team.slug}</td>
              <td className="border px-2 py-1">{team.name}</td>
              <td className="border px-2 py-1">{team.verified ? 'Yes' : 'No'}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => toggleVerified(team.slug)}
                  className="btn text-xs bg-blue-600 hover:bg-blue-700"
                >
                  {team.verified ? 'Unverify' : 'Verify'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}