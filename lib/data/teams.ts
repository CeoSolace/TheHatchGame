export interface Team {
  slug: string
  name: string
  description: string
  logoUrl: string
  bannerUrl: string
  donateLink: string
  verified: boolean
}

// No fake teams in production.
// When Mongo is enabled, load teams from DB in /api/teams.
export const teams: Team[] = []
