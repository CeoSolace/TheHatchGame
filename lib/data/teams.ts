export interface Team {
  slug: string
  name: string
  description: string
  logoUrl: string
  bannerUrl: string
  donateLink: string
  verified: boolean
}

export const teams: Team[] = [
  {
    slug: 'alpha',
    name: 'Team Alpha',
    description: 'The first official team of THE HATCH.',
    logoUrl: 'https://res.cloudinary.com/demo/image/upload/sample',
    bannerUrl: 'https://res.cloudinary.com/demo/image/upload/sample',
    donateLink: 'https://example.com',
    verified: true,
  },
  {
    slug: 'bravo',
    name: 'Team Bravo',
    description: 'An up‑and‑coming group of daredevils.',
    logoUrl: 'https://res.cloudinary.com/demo/image/upload/sample',
    bannerUrl: 'https://res.cloudinary.com/demo/image/upload/sample',
    donateLink: 'https://example.com',
    verified: false,
  },
]