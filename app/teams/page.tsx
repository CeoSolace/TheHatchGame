import Link from 'next/link'
import { teams } from '@/lib/data/teams'

export const metadata = {
  title: 'Teams | THE HATCH',
}

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teams</h1>
      <p className="text-gray-300">
        Browse community teams, support your favourites or apply to create your own.
      </p>

      {teams.length === 0 && (
        <div className="border border-gray-700 rounded p-4 text-gray-300">
          No teams yet. Be the first to apply and create one.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <Link
            href={`/teams/${team.slug}`}
            key={team.slug}
            className="border border-gray-700 rounded overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <h3 className="font-semibold text-lg flex items-center">
                {team.name}
                {team.verified && <span className="ml-2 text-blue-400 text-xs">✔️</span>}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{team.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/teams/apply" className="btn">Apply to create a team</Link>
    </div>
  )
}
