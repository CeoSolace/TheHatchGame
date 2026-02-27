import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/server/adminSession'

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Check if admin credentials are configured
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
    notFound()
  }
  // Validate session cookie
  const cookieStore = cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = getSession(token)
  if (!session) {
    redirect('/admin/login')
  }
  return (
    <div className="min-h-screen">
      <header className="bg-gray-800 text-white py-2 px-4 flex justify-between">
        <h1 className="font-bold">Admin Panel</h1>
        <form action="/api/admin/login" method="post">
          <button className="text-sm underline" formMethod="delete">Logout</button>
        </form>
      </header>
      <main className="p-4 space-y-4">{children}</main>
    </div>
  )
}