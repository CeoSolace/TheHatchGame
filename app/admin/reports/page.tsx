"use client"
import { useEffect, useState } from 'react'

interface Report {
  id: string
  reportedUserId: string
  category: string
  text: string
  roomId: string
  events: any[]
  createdAt: number
  reviewed: boolean
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/reports', { cache: 'no-store' })
      const data = await res.json()
      setReports(data)
    } catch (e) {
      setError('Failed to load reports')
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function mark(id: string, action: 'reviewed' | 'dismiss') {
    await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    load()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Reports</h2>
      {error && <p className="text-red-500">{error}</p>}
      {reports.length === 0 && <p>No reports.</p>}
      <ul className="space-y-2">
        {reports.map((report) => (
          <li key={report.id} className="border border-gray-700 p-2 rounded">
            <p className="text-sm text-gray-400">{new Date(report.createdAt).toLocaleString()}</p>
            <p>
              <strong>User:</strong> {report.reportedUserId} | <strong>Category:</strong> {report.category}
            </p>
            <p>{report.text}</p>
            <div className="flex gap-2 mt-2">
              {!report.reviewed && (
                <>
                  <button onClick={() => mark(report.id, 'reviewed')} className="btn bg-green-600 hover:bg-green-700 text-xs">Mark Reviewed</button>
                  <button onClick={() => mark(report.id, 'dismiss')} className="btn bg-red-600 hover:bg-red-700 text-xs">Dismiss</button>
                </>
              )}
              {report.reviewed && <span className="text-green-500 text-sm">Reviewed</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}