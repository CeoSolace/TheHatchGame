"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.status === 200) {
        router.push('/admin/dashboard')
      } else if (res.status === 404) {
        setError('Admin panel is disabled.')
      } else {
        const data = await res.json()
        setError(data.error || 'Login failed')
      }
    } catch (e) {
      setError('Network error')
    }
  }
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-center">Admin Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      />
      <button onClick={submit} className="btn w-full">Login</button>
    </div>
  )
}