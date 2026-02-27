import { notFound } from 'next/navigation'
import Image from 'next/image'
import { teams } from '@/lib/data/teams'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const team = teams.find((t) => t.slug === params.slug)
  return {
    title: team ? `${team.name} | Teams` : 'Team Not Found',
  }
}

export default function TeamPage({ params }: Props) {
  const team = teams.find((t) => t.slug === params.slug)
  if (!team) notFound()
  return (
    <div className="space-y-6">
      <div className="h-40 rounded bg-cover bg-center" style={{ backgroundImage: `url(${team.bannerUrl})` }} />
      <div className="flex items-center space-x-4">
        <Image src={team.logoUrl} alt={team.name} width={80} height={80} className="rounded-full" />
        <h1 className="text-3xl font-bold flex items-center">
          {team.name}
          {team.verified && <span className="ml-2 text-blue-400 text-sm">✔️ Verified</span>}
        </h1>
      </div>
      <p>{team.description}</p>
      {team.donateLink.startsWith('https://') ? (
        <a href={team.donateLink} className="btn inline-block" target="_blank" rel="noopener noreferrer">
          Donate to this team
        </a>
      ) : (
        <p className="text-yellow-400">No donate link provided.</p>
      )}
    </div>
  )
}