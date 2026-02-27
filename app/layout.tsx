import './globals.css'
import type { ReactNode } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ServiceWorkerRegister from './components/ServiceWorkerRegister'

export const metadata = {
  title: 'THE HATCH',
  description: 'A chaotic social deduction game and storefront for THE HATCH.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-screen container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        {/* Register the service worker on the client */}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}