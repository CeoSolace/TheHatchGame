import { cookies } from 'next/headers'

async function fetchReports() {
  const res = await fetch('http://thehatch.store/api/reports', { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

async function fetchTeamApps() {
  const res = await fetch('http://thehatch.store/api/teams/apply', { cache: 'no-store' })
  return []
}

export default async function DashboardPage() {
  const reports = await fetchReports()
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-700 p-4 rounded">
          <h3 className="font-semibold">Reports</h3>
          <p>{reports.length}</p>
        </div>
        <div className="border border-gray-700 p-4 rounded">
          <h3 className="font-semibold">Users</h3>
          <p>—</p>
        </div>
      </div>
    </div>
  )
}