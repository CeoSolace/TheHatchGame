import Link from 'next/link'
import { teams } from '@/lib/data/teams'

export const metadata = {
  title: 'Teams | THE HATCH',
}

export default function TeamsPage() {
  // In a real implementation, this data would come from the database via API. Here we import a static list.
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teams</h1>
      <p>Browse community teams, support your favourites or apply to create your own.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <Link
            href={`/teams/${team.slug}`}
            key={team.slug}
            className="border border-gray-700 rounded overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              className="h-32 bg-cover bg-center"
              style={{ backgroundImage: `url(${team.bannerUrl})` }}
            />
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