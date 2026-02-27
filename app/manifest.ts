import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'THE HATCH',
    short_name: 'HATCH',
    description: 'A chaotic social deduction game and storefront.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#1f2937',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}