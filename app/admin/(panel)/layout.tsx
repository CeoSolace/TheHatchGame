import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/server/adminSession'

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  // Admin disabled if env vars missing
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) notFound()

  const token = cookies().get('admin_session')?.value
  const session = getSession(token)

  // Protect panel routes only
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen">
      <header className="bg-gray-900 text-white py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="font-bold">
            Admin Panel
          </Link>

          <nav className="text-sm flex gap-3">
            <Link className="hover:underline" href="/admin/dashboard">
              Dashboard
            </Link>
            <Link className="hover:underline" href="/admin/reports">
              Reports
            </Link>
            <Link className="hover:underline" href="/admin/users">
              Users
            </Link>
            <Link className="hover:underline" href="/admin/teams">
              Teams
            </Link>
            <Link className="hover:underline" href="/admin/invites">
              Invites
            </Link>
          </nav>
        </div>

        <form action="/api/admin/login" method="post">
          <button className="text-sm underline" formMethod="delete">
            Logout
          </button>
        </form>
      </header>

      <main className="p-4">{children}</main>
    </div>
  )
}
