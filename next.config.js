/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Enable TypeScript and ESLint options via default settings
  eslint: {
    // Warning only; don't fail build on lint errors
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
}

module.exports = nextConfig