"use client"
import { useState } from 'react'

export default function ApplyTeamPage() {
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setError(null)
    try {
      const res = await fetch('/api/teams/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, description }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Unknown error')
      } else {
        setStatus('Application submitted! You will be notified once reviewed.')
        setSlug('')
        setName('')
        setDescription('')
      }
    } catch (err) {
      setError('Failed to submit application')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Apply for a Team</h1>
      <p>Fill out the form below to request creation of a new team. An admin will review your application.</p>
      {status && <p className="text-green-400">{status}</p>}
      {error && <p className="text-red-500">{error}</p>}
      <input
        placeholder="Slug (e.g. my-team)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      />
      <input
        placeholder="Team Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      />
      <button onClick={submit} className="btn w-full">Submit</button>
    </div>
  )
}